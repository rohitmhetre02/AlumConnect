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
  const loginUrl = process.env.USER_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173'

  const subject = `🎉 Welcome to APCOER Alumni Portal - Your ${capitalizedRole} Account is Ready!`

  const text = `
Hello ${displayName},

🎓 Your ${capitalizedRole} account has been successfully created in the APCOER Alumni Portal.

📌 Account Details:
Email: ${email}
Password: ${password}

⚠️ Important:
This is a temporary password. Please change it after your first login.

🔗 Login here:
${loginUrl}

Next Steps:
- Login using your credentials
- Complete your profile
- Change your password
- Start connecting with alumni

If you need help, contact support.

Best regards,  
APCOER Alumni Portal Team
`

  const html = `
<div style="font-family: Arial; max-width:600px; margin:auto; padding:20px;">
  <h2 style="color:#2563eb;">🎉 Welcome to APCOER Alumni Portal</h2>
  <p>Hello <strong>${displayName}</strong>,</p>

  <p>Your <strong>${capitalizedRole}</strong> account has been created successfully.</p>

  <div style="background:#f9fafb; padding:15px; border-radius:8px;">
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${password}</p>
  </div>

  <p style="color:#b45309;"><strong>⚠️ Please change your password after login.</strong></p>

  <div style="text-align:center; margin:20px;">
    <a href="${loginUrl}" style="background:#2563eb; color:white; padding:12px 20px; text-decoration:none; border-radius:6px;">
      Login to Portal
    </a>
  </div>

  <p><strong>Next Steps:</strong></p>
  <ul>
    <li>Login to your account</li>
    <li>Complete profile</li>
    <li>Update password</li>
    <li>Connect with alumni</li>
  </ul>

  <p>Regards,<br/>APCOER Alumni Portal Team</p>
</div>
`

  return { subject, text, html }
}

const buildProfileApprovalEmailContent = ({ name, status, reason, role }) => {
  const displayName = name || 'User'
  const isApproved = String(status).toLowerCase() === 'approved'

  const subject = isApproved
    ? '🎉 Your Profile is Approved - APCOER Alumni Portal'
    : '⚠️ Profile Update Required - APCOER Alumni Portal'

  const text = `
Hello ${displayName},

${
  isApproved
    ? 'Your profile has been approved successfully. You now have full access.'
    : 'Your profile needs some updates before approval.'
}

${!isApproved && reason ? `Reviewer Feedback: ${reason}` : ''}

${
  isApproved
    ? 'You can now login and explore the portal.'
    : 'Please login, update your profile, and resubmit.'
}

Best regards,  
APCOER Alumni Portal Team
`

  const html = `
<p>Hello <strong>${displayName}</strong>,</p>

<p>
${
  isApproved
    ? '🎉 Your profile has been approved successfully.'
    : '⚠️ Your profile requires updates.'
}
</p>

${
  !isApproved && reason
    ? `<div style="background:#fee2e2; padding:10px; border-left:4px solid red;">
        <strong>Feedback:</strong> ${reason}
      </div>`
    : ''
}

<p>
${
  isApproved
    ? 'You can now login and use all features.'
    : 'Please update your profile and resubmit.'
}
</p>

<p>Regards,<br/>APCOER Alumni Portal Team</p>
`

  return { subject, text, html }
}

const buildPasswordResetEmailContent = ({ code, expiresInMinutes = 10 }) => {
  const subject = '🔐 APCOER Alumni Portal Password Reset'

  const text = `
Hello,

We received a request to reset your password.

Your OTP Code: ${code}

This code will expire in ${expiresInMinutes} minutes.

If you did not request this, please ignore this email.

Regards,  
APCOER Alumni Portal Team
`

  const html = `
<p>Hello,</p>

<p>We received a request to reset your password.</p>

<h2 style="letter-spacing:4px;">${code}</h2>

<p>This code will expire in ${expiresInMinutes} minutes.</p>

<p>If you did not request this, please ignore.</p>

<p>Regards,<br/>APCOER Alumni Portal Team</p>
`

  return { subject, text, html }
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