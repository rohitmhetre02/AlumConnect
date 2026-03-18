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
  const displayName = name || 'there'
  const capitalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'
  const loginUrl = process.env.USER_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
  
  const subject = `🎉 Welcome to AlumConnect - Your ${capitalizedRole} Account is Ready!`
  
  const intro = `Hello ${displayName},`
  
  const body = [
    intro,
    '',
    `🎊 <strong>Your ${capitalizedRole} account has been successfully created in AlumConnect!</strong>`,
    '',
    '📋 <strong>Your Account Details:</strong>',
    '',
    `📧 <strong>Email (Username):</strong> ${email}`,
    `🔐 <strong>Temporary Password:</strong> <code style="background: #f3f4f6; color: #fff; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${password}</code>`,
    '',
    `🚪 <strong>Important Security Note:</strong> This is a temporary password. Please change it after your first login for security purposes.`,
    '',
    `🔗 <strong>Login to Your Account:</strong>`,
    '',
    `<a href="${loginUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">🚀 Sign In to AlumConnect</a>`,
    '',
    '📱 <strong>Quick Access:</strong> You can also copy and paste this link in your browser:',
    '',
    `<code style="background: #f8fafc; border: 1px solid #e5e7eb; padding: 8px; border-radius: 4px; font-size: 12px; display: block; word-break: break-all;">${loginUrl}</code>`,
    '',
    '🎓 <strong>What to Do Next:</strong>',
    '<ol style="margin: 8px 0; padding-left: 20px;">',
    '<li>✅ Log in with your email and temporary password</li>',
    '<li>✅ Complete your profile information</li>',
    '<li>✅ Change your password to something memorable</li>',
    '<li>✅ Start connecting with alumni and mentors</li>',
    '</ol>',
    '',
    '💡 <strong>Need Help?</strong>',
    'If you have any questions or trouble logging in, please contact our support team.',
    '',
    'Best regards,',
    'The AlumConnect Team 🎓'
  ].join('\n')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div style="background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #3b82f6; margin: 0; font-size: 28px; font-weight: 700;">🎉 Welcome to AlumConnect!</h1>
          <p style="color: #6b7280; margin: 10px 0; font-size: 16px;">Your ${capitalizedRole} account is ready to use</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="color: #374151; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
            🔐 Your Account Credentials
          </h2>
          
          <div style="background: white; border-radius: 6px; padding: 20px; margin: 15px 0;">
            <div style="display: grid; gap: 15px;">
              <div>
                <p style="margin: 0; color: #6b7280; font-weight: 600;">📧 Email (Username):</p>
                <p style="margin: 5px 0; color: #374151; font-size: 16px; font-weight: 500;">${email}</p>
              </div>
              <div>
                <p style="margin: 0; color: #6b7280; font-weight: 600;">🔐 Temporary Password:</p>
                <p style="margin: 5px 0; padding: 15px; background: #f3f4f6; color: #fff; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center;">${password}</p>
              </div>
            </div>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Important Security Note:</p>
            <p style="margin: 5px 0; color: #78350f;">This is a temporary password. Please change it after your first login for security purposes.</p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
            🚀 Sign In to AlumConnect
          </a>
        </div>
        
        <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin: 0 0 15px 0;">📱 Quick Access Link</h3>
          <p style="margin: 0 0 10px 0; color: #6b7280;">Copy and paste this link in your browser:</p>
          <div style="background: white; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; word-break: break-all;">
            <code style="color: #374151; font-size: 14px;">${loginUrl}</code>
          </div>
        </div>
        
        <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #059669; margin: 0 0 15px 0;">🎓 What to Do Next</h3>
          <ol style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin: 8px 0;">✅ Log in with your email and temporary password</li>
            <li style="margin: 8px 0;">✅ Complete your profile information</li>
            <li style="margin: 8px 0;">✅ Change your password to something memorable</li>
            <li style="margin: 8px 0;">✅ Start connecting with alumni and mentors</li>
          </ol>
        </div>
        
        <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #92400e; margin: 0 0 15px 0;">💡 Need Help?</h3>
          <p style="margin: 0; color: #6b7280;">If you have any questions or trouble logging in, please contact our support team.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #9ca3af; font-size: 14px;">
            Best regards,<br>
            <strong>The AlumConnect Team 🎓</strong>
          </p>
        </div>
      </div>
    </div>
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
