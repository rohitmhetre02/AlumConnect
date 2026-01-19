const MODEL_FALLBACK = 'gemini-3.5-flash'
const MODEL_ALIASES = {
  flash: 'gemini-3.5-flash',
  'gemini-flash': 'gemini-3.5-flash',
  'gemini-1.5-flash': 'gemini-1.5-flash',
  'gemini-1.5-flash-latest': 'gemini-1.5-flash-latest',
  'gemini-1.5-pro': 'gemini-1.5-pro',
  'gemini-1.5-pro-latest': 'gemini-1.5-pro-latest',
  'gemini-1.0-pro': 'gemini-1.0-pro',
  'gemini-1.0-pro-latest': 'gemini-1.0-pro',
  'gemini-pro': 'gemini-pro',
  'gemini-3-flash-preview': 'gemini-3-flash-preview',
  'gemini-3-pro-preview': 'gemini-3-pro-preview',
  'gemini-3.5-flash': 'gemini-3.5-flash',
  'gemini-3.5-pro': 'gemini-3.5-pro',
}

const MODEL_SEQUENCE = [
  'gemini-3.5-flash',
  'gemini-3.5-pro',
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro-latest',
  'gemini-1.5-pro',
  'gemini-1.0-pro',
  'gemini-pro',
]

let cachedClient = null
let clientVariant = null

const loadGeminiClient = async (apiKey) => {
  if (cachedClient) {
    return { client: cachedClient, variant: clientVariant }
  }

  try {
    const module = await import('@google/genai')
    const { GoogleGenAI } = module
    if (typeof GoogleGenAI === 'function') {
      cachedClient = new GoogleGenAI({ apiKey })
      clientVariant = 'genai'
      return { client: cachedClient, variant: clientVariant }
    }
  } catch (error) {
    // ignore and fall back
  }

  const legacyModule = await import('@google/generative-ai')
  const { GoogleGenerativeAI } = legacyModule
  cachedClient = new GoogleGenerativeAI(apiKey)
  clientVariant = 'generative-ai'
  return { client: cachedClient, variant: clientVariant }
}

const normalizeModelName = (rawName) => {
  if (!rawName) return MODEL_FALLBACK
  const trimmed = rawName.trim()
  const lower = trimmed.toLowerCase()
  return MODEL_ALIASES[lower] || trimmed
}

const buildModelCandidateList = (preferredModel) => {
  const normalizedPreferred = normalizeModelName(preferredModel)
  const unique = []

  const addCandidate = (model) => {
    if (!model || unique.includes(model)) return
    unique.push(model)
  }

  addCandidate(normalizedPreferred)
  MODEL_SEQUENCE.forEach(addCandidate)

  return unique
}

const buildPrompt = ({ userProfile, mentors }) => {
  const systemPrompt = `You are an AI mentorship matching engine.
Your task is to intelligently match a user with the most suitable mentors.

USER PROFILE:
- Interests
- Skills
- Education / Background
- Career Goals
- Role (Student / Alumni)

MENTOR PROFILES:
- Expertise Areas
- Skills
- Years of Experience
- Industry
- Mentorship Focus

MATCHING RULES:
1. Compare user interests with mentor expertise.
2. Compare user skills with mentor skills.
3. Consider career goals and mentorship focus.
4. Prioritize mentors with higher relevance and experience.
5. Rank mentors by overall suitability.

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON.
- Provide TOP 5 mentors.
- Each mentor must include:
  - mentorId
  - matchScore (0–100)
  - shortReason (1–2 lines explaining the match)

RESPONSE FORMAT:
[
  {
    "mentorId": "string",
    "matchScore": number,
    "shortReason": "string"
  }
]

Do not include any explanation or text outside the JSON.`

  return [
    {
      role: 'system',
      parts: [{ text: systemPrompt }],
    },
    {
      role: 'user',
      parts: [
        {
          text: JSON.stringify(
            {
              userProfile,
              mentors,
            },
            null,
            2,
          ),
        },
      ],
    },
  ]
}

const parseMatches = (rawText) => {
  if (!rawText) {
    throw new Error('Empty response from Gemini')
  }

  const trimmed = rawText.trim()
  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) {
      throw new Error('Gemini response must be an array')
    }

    return parsed
      .map((item) => ({
        mentorId: item?.mentorId ?? item?.mentorID ?? item?.id,
        matchScore: (() => {
          const numeric = typeof item?.matchScore === 'number' ? item.matchScore : Number(item?.matchScore ?? 0)
          if (Number.isFinite(numeric)) {
            return Math.max(0, Math.min(100, Math.round(numeric)))
          }
          return 0
        })(),
        shortReason: item?.shortReason ?? item?.reason ?? '',
      }))
      .filter((item) => item.mentorId)
      .slice(0, 5)
  } catch (error) {
    throw new Error(`Unable to parse Gemini response: ${error.message}`)
  }
}

const extractText = (response) => {
  if (!response) return undefined

  if (typeof response.text === 'function') {
    try {
      return response.text()
    } catch (error) {
      // ignore
    }
  }

  if (typeof response.text === 'string') {
    return response.text
  }

  const target = response.response ?? response

  if (typeof target?.text === 'function') {
    return target.text()
  }

  if (typeof target?.text === 'string') {
    return target.text
  }

  const parts = target?.candidates?.[0]?.content?.parts
  if (Array.isArray(parts)) {
    const firstText = parts.find((part) => typeof part?.text === 'string')?.text
    if (firstText) {
      return firstText
    }
  }

  return undefined
}

const generateMentorMatches = async ({ userProfile, mentors }) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  if (!Array.isArray(mentors) || mentors.length === 0) {
    return []
  }

  const prompt = buildPrompt({ userProfile, mentors })
  const attemptedModels = []
  const candidates = buildModelCandidateList(process.env.GEMINI_MODEL)
  const generationConfig = {
    responseMimeType: 'application/json',
    temperature: 0.4,
    topK: 40,
    topP: 0.95,
  }

  for (const candidate of candidates) {
    try {
      const { client, variant } = await loadGeminiClient(apiKey)

      let response
      if (variant === 'genai') {
        response = await client.models.generateContent({
          model: candidate,
          contents: prompt,
          generationConfig,
        })
      } else {
        const model = client.getGenerativeModel({
          model: candidate,
          generationConfig,
        })
        response = await model.generateContent({ contents: prompt })
      }

      const text = extractText(response)
      return parseMatches(text)
    } catch (error) {
      attemptedModels.push(`${candidate}: ${error?.message ?? error}`)

      const message = String(error?.message ?? '').toLowerCase()
      if (message.includes('api key not valid') || message.includes('invalid api key')) {
        break
      }
    }
  }

  throw new Error(
    `Unable to generate mentor matches via Gemini. Tried models -> ${attemptedModels.join(' | ') || 'no attempts recorded'}`,
  )
}

module.exports = {
  generateMentorMatches,
}
