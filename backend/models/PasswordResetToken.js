const mongoose = require('mongoose')

const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, required: true, lowercase: true, trim: true },
    codeHash: { type: String, required: true },
    codeExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    resetTokenHash: { type: String, default: null },
    resetTokenExpiresAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

passwordResetTokenSchema.index({ email: 1 }, { unique: true })
passwordResetTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 })

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema)
