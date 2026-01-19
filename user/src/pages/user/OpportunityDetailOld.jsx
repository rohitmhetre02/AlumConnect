import { useNavigate, useParams } from 'react-router-dom'
import { useOpportunity } from '../../hooks/useOpportunities'

const OpportunityDetailOld = () => {
  const { opportunityId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useOpportunity(opportunityId)
  const normalizedType = data?.type
    ? data.type
        .split(/[\s_-]+/)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : 'Opportunity'
  const descriptionParagraphs = (data?.description ?? '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (loading) {
    return (
      <article className="rounded-3xl bg-white p-8 text-center text-sm text-slate-400 shadow-soft">
        Loading opportunity...
      </article>
    )
  }

  if (error || !data) {
    return (
      <article className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {error?.message ?? 'Opportunity not found or unavailable.'}
        </div>
      </article>
    )
  }

  return (
    <article className="space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          ←
        </span>
        Back to opportunities
      </button>

      <section className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="bg-gradient-to-r from-primary via-primary-dark to-primary px-8 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{normalizedType}</p>
          <h1 className="mt-2 text-3xl font-bold">{data.title}</h1>
          <p className="mt-1 text-sm text-white/80">
            {data.company} &bull; {data.location}
          </p>
        </div>

        <div className="space-y-10 px-8 py-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{data.company}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{data.location}</p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employment Type</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{normalizedType}</p>
            </div>
            {data.contactEmail && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:col-span-2 lg:col-span-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Point of Contact</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{data.contactEmail}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Role Overview</h2>
            {descriptionParagraphs.length > 0 ? (
              <div className="space-y-4 text-base leading-relaxed text-slate-600">
                {descriptionParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="text-base text-slate-500">No role description provided.</p>
            )}
          </div>

          {(data.tags ?? []).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Key Skills &amp; Focus Areas</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {data.contactEmail && (
          <a
            href={`mailto:${data.contactEmail}`}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
          >
            Send Email
          </a>
        )}
        <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
          Request Referral
        </button>
      </div>
    </article>
  )
}

export default OpportunityDetailOld
