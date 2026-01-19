const ProfileOverview = ({ profile, onEditSection, role }) => {
  const { about, contact, socials = {}, skills = [] } = profile

  return (
    <div className="space-y-6">
      <Card title="About" section="about" onEdit={onEditSection} role={role}>
        <p className="text-sm leading-6 text-slate-600">{about || 'Passionate professional with a strong background in software development and problem solving.'}</p>
      </Card>

      <Card title="Contact" section="contact" onEdit={onEditSection} role={role}>
        <div className="space-y-3 text-sm text-slate-600">
          <InfoRow icon={<MailIcon />} primary={contact.email || 'contact@example.com'} />
          <InfoRow icon={<PhoneIcon />} primary={contact.phone || '+1 (555) 000-0000'} />
        </div>
      </Card>

      <Card title="Socials" section="socials" onEdit={onEditSection} role={role}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {socials.linkedin ? (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-4 w-4" />
              </a>
            ) : (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-300">
                <LinkedInIcon className="h-4 w-4" />
              </div>
            )}
            {socials.github ? (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                aria-label="GitHub"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            ) : (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-300">
                <GithubIcon className="h-4 w-4" />
              </div>
            )}
            {socials.instagram ? (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            ) : (
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-300">
                <InstagramIcon className="h-4 w-4" />
              </div>
            )}
            {Object.entries(socials)
              .filter(([key]) => !['linkedin', 'github', 'instagram'].includes(key.toLowerCase()))
              .map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                  aria-label={label}
                >
                  <GlobeIcon className="h-4 w-4" />
                </a>
              ))}
          </div>
          
          {Object.keys(socials).length === 0 && (
            <span className="text-xs text-slate-400">Add your social profiles to showcase your presence.</span>
          )}
        </div>
      </Card>

      {/* Only show Skills for non-faculty roles */}
      {role !== 'faculty' && (
        <Card title="Skills" section="skills" onEdit={onEditSection} role={role}>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400">Add skills to highlight your expertise.</span>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

const Card = ({ title, section, onEdit, children, role }) => {
  // Faculty cannot edit certain sections
  const canEdit = role !== 'faculty' || !['skills'].includes(section)
  
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</h2>
        {onEdit && canEdit && (
          <button
            type="button"
            onClick={() => onEdit(section)}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
          >
            Edit
          </button>
        )}
      </header>
      <div className="mt-4 space-y-3">{children}</div>
    </article>
  )
}

const InfoRow = ({ icon, primary }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
    <span className="text-primary">{icon}</span>
    <span className="text-sm font-medium text-slate-600">{primary}</span>
  </div>
)

const IconBase = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
)

const MailIcon = (props) => (
  <IconBase {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <polyline points="3 7 12 13 21 7" />
  </IconBase>
)

const PhoneIcon = (props) => (
  <IconBase {...props}>
    <path d="M22 16.92v3a2 2 0 01-2.18 2A19.8 19.8 0 013 5.18 2 2 0 015 3h3a2 2 0 012 1.72 12.6 12.6 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 11.91a16 16 0 006 6l2.27-2.27a2 2 0 012.11-.45 12.6 12.6 0 002.81.7A2 2 0 0122 16.92z" />
  </IconBase>
)

const SocialIcon = ({ network }) => {
  const key = network.toLowerCase()
  switch (key) {
    case 'linkedin':
      return <LinkedInIcon className="h-4 w-4" />
    case 'github':
      return <GithubIcon className="h-4 w-4" />
    case 'instagram':
      return <InstagramIcon className="h-4 w-4" />
    case 'twitter':
    case 'x':
      return <TwitterIcon className="h-4 w-4" />
    default:
      return <GlobeIcon className="h-4 w-4" />
  }
}

const LinkedInIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </IconBase>
)

const GithubIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1a5.07 5.07 0 00-.11 3.76 5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 21.13V25" />
  </IconBase>
)

const TwitterIcon = (props) => (
  <IconBase {...props}>
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0016 2a4.48 4.48 0 00-4.47 4.47A4.65 4.65 0 0011.09 8 12.94 12.94 0 013 4s-4 9 5 13a13.34 13.34 0 01-8 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
  </IconBase>
)

const GlobeIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </IconBase>
)

const InstagramIcon = (props) => (
  <IconBase {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </IconBase>
)

const PlusIcon = (props) => (
  <IconBase {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconBase>
)

export default ProfileOverview
