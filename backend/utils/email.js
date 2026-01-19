const nodemailer = require('nodemailer')

let cachedTransporter = null

const isEmailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  )

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter
  if (!isEmailConfigured()) {
    throw new Error('Email transport not configured. Please set SMTP environment variables.')
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE ?? '').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return cachedTransporter
}

const buildCredentialEmailContent = ({ name, email, password, role }) => {
  const displayName = name || email
  const portalRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'user'

  const subject = `Your ${portalRole} access to AlumConnect`
  const intro = `Hello ${displayName},`
  const body = [
    `${intro}`,
    '',
    'Your account has been provisioned. Use the credentials below to log in:',
    `Email (username): ${email}`,
    `Temporary password: ${password}`,
    '',
    'Please sign in and change your password after your first login.',
    '',
    'Best regards,',
    'AlumConnect Team',
  ].join('\n')

  const html = `
    <p>${intro}</p>
    <p>Your account has been provisioned. Use the credentials below to log in:</p>
    <ul>
      <li><strong>Email (username):</strong> ${email}</li>
      <li><strong>Temporary password:</strong> ${password}</li>
    </ul>
    <p>Please sign in and change your password after your first login.</p>
    <p>Best regards,<br/>AlumConnect Team</p>
  `

  return { subject, text: body, html }
}

const buildProfileApprovalEmailContent = ({ name, status, reason, role }) => {
  const displayName = name || 'there'
  const normalizedStatus = String(status || '').toLowerCase()
  const capitalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Profile'

  const isApproved = normalizedStatus === 'approved'
  const subject = isApproved
    ? `${capitalizedRole} profile approved`
    : `${capitalizedRole} profile needs updates`

  const intro = `Hello ${displayName},`

  const textBody = [
    intro,
    '',
    isApproved
      ? 'Great news! Your profile has been reviewed and approved by the admin team. You now have full access to all available features.'
      : 'Your profile has been reviewed, but we need a few updates before it can be approved.',
    !isApproved && reason ? `Feedback from the reviewer: ${reason}` : null,
    '',
    isApproved
      ? 'You can now sign in and continue engaging with the community.'
      : 'Please sign in to your account, address the feedback, and resubmit your profile for review.',
    '',
    'Best regards,',
    'AlumConnect Team',
  ]
    .filter(Boolean)
    .join('\n')

  const htmlBody = `
    <p>${intro}</p>
    <p>
      ${
        isApproved
          ? 'Great news! Your profile has been reviewed and approved by the admin team. You now have full access to all available features.'
          : 'Your profile has been reviewed, but we need a few updates before it can be approved.'
      }
    </p>
    ${
      !isApproved && reason
        ? `<p style="margin: 12px 0; padding: 12px; background: #f8fafc; border-left: 4px solid #ef4444;"><strong>Reviewer feedback:</strong><br/>${reason}</p>`
        : ''
    }
    <p>
      ${
        isApproved
          ? 'You can now sign in and continue engaging with the community.'
          : 'Please sign in to your account, address the feedback, and resubmit your profile for review.'
      }
    </p>
    <p>Best regards,<br/>AlumConnect Team</p>
  `

  return { subject, text: textBody, html: htmlBody }
}

const buildPasswordResetEmailContent = ({ code, expiresInMinutes = 10 }) => {
  const subject = 'Reset your AlumConnect password'
  const intro = 'Hello,'
  const body = [
    intro,
    '',
    'We received a request to reset the password associated with this email address.',
    `Use the following one-time code to proceed with resetting your password: ${code}`,
    '',
    `This code will expire in ${expiresInMinutes} minutes. If you did not request a password reset, you can ignore this email.`,
    '',
    'Best regards,',
    'AlumConnect Team',
  ].join('\n')

  const html = `
    <p>${intro}</p>
    <p>We received a request to reset the password associated with this email address.</p>
    <p style="font-size: 20px; font-weight: 600; letter-spacing: 4px;">${code}</p>
    <p>This code will expire in ${expiresInMinutes} minutes. If you did not request a password reset, you can ignore this email.</p>
    <p>Best regards,<br/>AlumConnect Team</p>
  `

  return { subject, text: body, html }
}

const sendUserCredentialsEmail = async ({ to, name, email, password, role }) => {
  if (!isEmailConfigured()) {
    console.warn('SMTP configuration missing. Skipping email send for', email)
    return { skipped: true }
  }

  try {
    const transporter = getTransporter()
    const { subject, text, html } = buildCredentialEmailContent({ name, email, password, role })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    })

    return { sent: true, info }
  } catch (error) {
    console.error('Failed to send credentials email:', error)
    return { sent: false, error }
  }
}

const sendPasswordResetCodeEmail = async ({ to, code, expiresInMinutes }) => {
  if (!isEmailConfigured()) {
    console.warn('SMTP configuration missing. Skipping password reset email for', to)
    return { skipped: true }
  }

  try {
    const transporter = getTransporter()
    const { subject, text, html } = buildPasswordResetEmailContent({ code, expiresInMinutes })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    })

    return { sent: true, info }
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    return { sent: false, error }
  }
}

const sendProfileApprovalStatusEmail = async ({ to, name, status, reason, role }) => {
  if (!isEmailConfigured()) {
    console.warn('SMTP configuration missing. Skipping profile approval email for', to)
    return { skipped: true }
  }

  try {
    const transporter = getTransporter()
    const { subject, text, html } = buildProfileApprovalEmailContent({ name, status, reason, role })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html,
    })

    return { sent: true, info }
  } catch (error) {
    console.error('Failed to send profile approval email:', error)
    return { sent: false, error }
  }
}

module.exports = {
  sendUserCredentialsEmail,
  sendPasswordResetCodeEmail,
  sendProfileApprovalStatusEmail,
  isEmailConfigured,
}
