import { useRef } from 'react'
import Avatar from '../../ui/Avatar'
import Modal from '../../ui/Modal'
import useModal from '../../../hooks/useModal'
import useMessages from '../../../hooks/useMessages'
import { useAuth } from '../../../context/AuthContext'
import ChatModal from './ChatModal'

const roleLabels = {
  students: 'Student',
  alumni: 'Alumni',
  faculty: 'Faculty',
}

const StatPill = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-white/80 px-5 py-4 text-center shadow-sm">
    <p className="text-xl font-semibold text-slate-900">{value}</p>
    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
  </div>
)

const DetailSection = ({ title, children }) => (
  <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</h3>
    <div className="mt-4 space-y-3 text-sm text-slate-600">{children}</div>
  </section>
)

const DirectoryProfileModal = ({ isOpen, onClose, person }) => {
  const { user } = useAuth()
  const { getConversationWith, joinConversation } = useMessages()
  const chatModal = useModal(false)
  const conversationIdRef = useRef(null)

  if (!person) return null

  const {
    name,
    avatar,
    role,
    title,
    location,
    program,
    email,
    phone,
    stats = {},
    about,
    experiences = [],
    education = [],
    skills = [],
    badges = [],
    socials = {},
  } = person

  const statItems = [
    { label: 'Connections', value: stats.connections ?? 0 },
    { label: 'Mentorships', value: stats.mentorships ?? 0 },
    { label: 'Profile Views', value: stats.views ?? 0 },
  ]

  const socialEntries = Object.entries(socials).filter(([, value]) => Boolean(value))

  const targetId = person?._id ?? person?.id

  const handleMessageClick = async () => {
    if (!user || !targetId) return
    try {
      const conversation = await getConversationWith({ recipientId: targetId, recipientRole: person.role })
      if (conversation?._id) {
        conversationIdRef.current = conversation._id
        joinConversation(conversation._id)
      } else {
        conversationIdRef.current = null
      }
      chatModal.openModal()
    } catch (err) {
      console.error('Failed to open conversation from DirectoryProfileModal:', err)
    }
  }

  const handleViewAllMessages = (conversationId) => {
    chatModal.closeModal()
    const targetConversation = conversationId ?? conversationIdRef.current ?? null
    window.dispatchEvent(
      new CustomEvent('app:openMessagesPanel', {
        detail: { conversationId: targetConversation },
      })
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="max-w-5xl">
      <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
        <div className="relative h-44 bg-gradient-to-r from-primary via-primary-dark to-indigo-600" />

        <div className="space-y-8 px-6 pb-8 sm:px-8">
          <div className="relative -mt-16 flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-8">
            <span className="inline-flex rounded-full border-4 border-white bg-white p-2 shadow-lg">
              <Avatar src={avatar} name={name} size="lg" />
            </span>
            <div className="flex-1 space-y-2">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">{name}</h2>
                {title ? <p className="mt-1 text-sm text-slate-500">{title}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                {location ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M10 2a6 6 0 016 6c0 4.418-6 9-6 9S4 12.418 4 8a6 6 0 016-6zm0 8a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {location}
                  </span>
                ) : null}
                {program ? <span className="rounded-full bg-slate-100 px-3 py-1">{program}</span> : null}
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  {roleLabels[role] ?? 'Member'}
                </span>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Connect
              </button>
              {user && targetId && user.id !== targetId && (
                <button
                  type="button"
                  onClick={handleMessageClick}
                  className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Message
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center sm:grid-cols-3">
            {statItems.map((item) => (
              <StatPill key={item.label} {...item} />
            ))}
          </div>

          {about ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">About</h3>
              <p className="mt-3 text-base text-slate-600">{about}</p>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[minmax(0,_1fr)_1.2fr]">
            <div className="space-y-6">
              <DetailSection title="Contact & Socials">
                {email ? (
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 6h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                        <path d="M22 8l-10 6L2 8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</p>
                      <p className="mt-1 break-all text-sm text-slate-600">{email}</p>
                    </div>
                  </div>
                ) : null}
                {phone ? (
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 5.5A2.5 2.5 0 015.5 3h1.086a1.5 1.5 0 011.414 1.086l.572 2.29a1.5 1.5 0 01-.43 1.42l-1.12 1.12a16 16 0 006.364 6.364l1.12-1.12a1.5 1.5 0 011.42-.43l2.29.572A1.5 1.5 0 0121 18.414V19.5A2.5 2.5 0 0118.5 22h-1A14.5 14.5 0 013 7.5v-2z"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Phone</p>
                      <p className="mt-1 text-sm text-slate-600">{phone}</p>
                    </div>
                  </div>
                ) : null}

                {socialEntries.length ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Social Profiles</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {socialEntries.map(([platform, link]) => (
                        <a
                          key={platform}
                          href={link ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                        >
                          {platform}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </DetailSection>

              {skills.length ? (
                <DetailSection title="Skills">
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </DetailSection>
              ) : null}

              {badges.length ? (
                <DetailSection title="Badges & Certifications">
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <span
                        key={badge}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                      >
                        <svg className="h-4 w-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path d="M10 2l2.39 4.848 5.36.78-3.875 3.776.915 5.336L10 14.84l-4.79 2.9.915-5.336L2.25 7.628l5.36-.78L10 2z" />
                        </svg>
                        {badge}
                      </span>
                    ))}
                  </div>
                </DetailSection>
              ) : null}
            </div>

            <div className="space-y-6">
              {experiences.length ? (
                <DetailSection title="Professional Experience">
                  <div className="space-y-4">
                    {experiences.map((experience, index) => (
                      <div key={`${experience.title}-${index}`} className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-sm font-semibold text-slate-900">{experience.title}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{experience.company}</p>
                        <p className="mt-1 text-xs text-slate-400">{experience.duration}</p>
                        {experience.description ? <p className="mt-2 text-sm text-slate-600">{experience.description}</p> : null}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              ) : null}

              {education.length ? (
                <DetailSection title="Education">
                  <div className="space-y-4">
                    {education.map((item, index) => (
                      <div key={`${item.school}-${index}`} className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-sm font-semibold text-slate-900">{item.school}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.degree}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.year}</p>
                        {item.grade ? (
                          <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                            {item.grade}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </DetailSection>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={chatModal.closeModal}
        recipient={{ _id: person?._id, role: person?.role, name }}
        onViewAllMessages={handleViewAllMessages}
      />
    </Modal>
  )
}

export default DirectoryProfileModal
