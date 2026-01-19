const DEFAULT_LENGTH = 12
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%'

const generateTemporaryPassword = (length = DEFAULT_LENGTH) => {
  const targetLength = Number.isInteger(length) && length > 6 ? length : DEFAULT_LENGTH
  let password = ''

  for (let i = 0; i < targetLength; i += 1) {
    const index = Math.floor(Math.random() * CHARSET.length)
    password += CHARSET.charAt(index)
  }

  return password
}

const generateNumericCode = (length = 6) => {
  const digits = Math.max(4, Math.min(8, Number.parseInt(length, 10) || 6))
  let code = ''
  for (let i = 0; i < digits; i += 1) {
    code += Math.floor(Math.random() * 10)
  }
  return code
}

module.exports = {
  generateTemporaryPassword,
  generateNumericCode,
}
