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
  const displayName = name || 'User'
  const capitalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member'
  const loginUrl = process.env.EMAIL_URL

  const subject = `Access to Alumni Portal – APCOER`

  const text = `
Dear ${displayName},

Greetings from Anantrao Pawar College of Engineering & Research!

We are pleased to share that the Alumni Portal of the institute is now available. As part of our alumni outreach, an account has been created for you.

You may access the portal using the following credentials:

Email ID: ${email}
Password: ${password}

For security purposes, we recommend updating your password after your first login.

Login here: ${loginUrl}

This platform helps you stay connected with the institute and fellow alumni, keep up with updates and opportunities, and offer mentorship to students.

If you have any questions or require assistance, please feel free to contact us at rohit.mhetre@abmspcoerpune.org.

Warm regards,
Alumni Relations Cell
APCOER, Parvati, Pune – 411009
`

  return { subject, text }
}

const buildProfileApprovalEmailContent = ({ name, status, reason, role }) => {
  const displayName = name || 'User'
  const isApproved = String(status).toLowerCase() === 'approved'
  const loginUrl = process.env.EMAIL_URL

  const subject = isApproved
    ? 'Profile Approved - APCOER Alumni Portal'
    : 'Profile Update Required - APCOER Alumni Portal'

  const text = `
Dear ${displayName},

${
  isApproved
    ? 'Your profile has been approved successfully. You now have full access to the APCOER Alumni Portal.'
    : 'Your profile needs some updates before approval.'
}

${!isApproved && reason ? `Reviewer Feedback: ${reason}` : ''}

${
  isApproved
    ? `You can now login and explore the portal: ${loginUrl}`
    : `Please login, update your profile, and resubmit: ${loginUrl}`
}

If you have any questions, please contact us at rohit.mhetre@abmspcoerpune.org.

Warm regards,
Alumni Relations Cell
APCOER, Parvati, Pune – 411009
`

  return { subject, text }
}

const buildPasswordResetEmailContent = ({ code, expiresInMinutes = 10 }) => {
  const subject = 'Password Reset - APCOER Alumni Portal'

  const text = `
Dear User,

We received a request to reset your password for the APCOER Alumni Portal.

Your OTP Code: ${code}

This code will expire in ${expiresInMinutes} minutes.

If you did not request this, please ignore this email.

For assistance, please contact us at rohit.mhetre@abmspcoerpune.org.

Warm regards,
Alumni Relations Cell
APCOER, Parvati, Pune – 411009
`

  return { subject, text }
}

const sendUserCredentialsEmail = async ({ to, name, email, password, role }) => {
  if (!isEmailConfigured()) {
    console.warn('SMTP configuration missing. Skipping email send for', email)
    return { skipped: true }
  }

  try {
    const transporter = getTransporter()
    const { subject, text } = buildCredentialEmailContent({ name, email, password, role })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
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
    const { subject, text } = buildPasswordResetEmailContent({ code, expiresInMinutes })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
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
    const { subject, text } = buildProfileApprovalEmailContent({ name, status, reason, role })

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
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