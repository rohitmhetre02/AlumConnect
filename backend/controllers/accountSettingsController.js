const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { getModelByRole } = require('../utils/roleModels');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to get user by ID using role-based approach
const getUserById = async (userId) => {
  const roles = ['student', 'alumni', 'faculty', 'admin', 'coordinator'];
  for (const role of roles) {
    const Model = getModelByRole(role);
    try {
      const user = await Model.findById(userId);
      if (user) return user;
    } catch (error) {
      // Continue to next role
    }
  }
  return null;
};

// Helper function to find user by email using role-based approach
const getUserByEmail = async (email) => {
  const roles = ['student', 'alumni', 'faculty', 'admin', 'coordinator'];
  for (const role of roles) {
    const Model = getModelByRole(role);
    try {
      const user = await Model.findOne({ email });
      if (user) return user;
    } catch (error) {
      // Continue to next role
    }
  }
  return null;
};

// Helper function to update user by ID using role-based approach
const updateUserById = async (userId, updateData) => {
  console.log('=== UPDATE USER BY ID DEBUG ===');
  console.log('Updating user:', userId, 'with data:', updateData);
  
  const roles = ['student', 'alumni', 'faculty', 'admin', 'coordinator'];
  
  for (const role of roles) {
    const Model = getModelByRole(role);
    try {
      console.log('🔍 Trying to update in', role, 'collection');
      console.log('Model exists:', !!Model);
      
      // First check if user exists in this collection
      const existingUser = await Model.findById(userId);
      if (existingUser) {
        console.log(`✅ Found user in ${role} collection:`, {
          id: existingUser._id,
          currentEmail: existingUser.email,
          role: existingUser.role
        });
        
        // Update the user
        const user = await Model.findByIdAndUpdate(userId, updateData, { new: true });
        if (user) {
          console.log(`✅ Successfully updated user in ${role} collection:`, {
            id: user._id,
            newEmail: user.email,
            updatedAt: user.updatedAt
          });
          console.log('=== UPDATE SUCCESSFUL ===\n');
          return user;
        } else {
          console.log(`❌ Failed to update user in ${role} collection`);
        }
      } else {
        console.log(`ℹ️ User not found in ${role} collection`);
      }
    } catch (error) {
      console.log(`❌ Error updating in ${role} collection:`, error.message);
      // Continue to next role
    }
  }
  
  console.log('❌ User not found in any collection for ID:', userId);
  console.log('=== UPDATE FAILED ===\n');
  return null;
};

// Store OTP attempts (in production, use Redis or database)
const otpAttempts = new Map();
const otpCooldowns = new Map();

// Send email with OTP
const sendEmailOTP = async (email, otp, purpose) => {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${purpose} - AlumniConnect OTP`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #333; margin: 0;">Email Verification</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <p style="color: #666; margin: 0 0 20px 0;">Your OTP code is:</p>
              <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; display: inline-block; margin: 10px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 3px;">${otp}</span>
              </div>
              <p style="color: #999; font-size: 14px; margin: 20px 0 0;">This code will expire in 5 minutes.</p>
              <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Password validation
const validatePassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` };
  }
  if (!hasUppercase) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowercase) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumber) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain at least one special character' };
  }

  return { valid: true };
};

// POST /api/auth/update-email
const updateEmail = async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;
    console.log('=== EMAIL UPDATE DEBUG ===');
    console.log('Request body:', { currentPassword: '***', newEmail });
    console.log('User from token:', req.user);
    
    const user = await getUserById(req.user.id);

    if (!user) {
      console.log('❌ User not found:', req.user.id);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log('✅ User found:', { id: user._id, currentEmail: user.email, role: user.role });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      console.log('❌ Invalid password provided');
      return res.status(400).json({ success: false, error: 'Incorrect password' });
    }

    console.log('✅ Password verified successfully');

    // Check if email is already in use by another user
    const existingUser = await getUserByEmail(newEmail);

    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      console.log('❌ Email already in use by another user:', newEmail);
      return res.status(400).json({ success: false, error: 'Email address already in use' });
    }

    console.log('✅ Email is available for use');

    // Directly update email without OTP
    console.log('🔄 Updating email from', user.email, 'to', newEmail);
    const updatedUser = await updateUserById(user._id, { 
      email: newEmail,
      emailVerified: true,
      emailVerifiedAt: new Date()
    });

    if (!updatedUser) {
      console.log('❌ Failed to update user in database');
      return res.status(500).json({ success: false, error: 'Failed to update email in database' });
    }

    console.log('✅ Email updated successfully in database!');
    console.log('Updated user:', { id: updatedUser._id, newEmail: updatedUser.email });

    // Double-check the update
    const verifyUser = await getUserById(user._id);
    console.log('🔍 Verification - Current email in DB:', verifyUser.email);

    res.json({ 
      success: true, 
      message: 'Email updated successfully',
      user: updatedUser // Return updated user data
    });

    console.log('=== EMAIL UPDATE COMPLETE ===\n');

  } catch (error) {
    console.error('❌ Email update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update email' });
  }
};

// POST /api/auth/verify-email-otp
const verifyEmailOTP = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;
    const emailKey = req.user.id + '_email';

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== 'email-update') {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Check OTP attempts
    if (otpAttempts.has(emailKey) && otpAttempts.get(emailKey) >= 5) {
      return res.status(429).json({ success: false, error: 'Too many attempts. Please try again later.' });
    }

    if (decoded.otp !== otp) {
      const attempts = otpAttempts.get(emailKey) || 0;
      otpAttempts.set(emailKey, attempts + 1);
      
      const remainingAttempts = 5 - (attempts + 1);
      return res.status(400).json({ 
        success: false, 
        error: `Invalid OTP. ${remainingAttempts} attempts remaining` 
      });
    }

    // Get user and update email
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update email and mark as verified
    await updateUserById(user._id, { 
      email: decoded.email,
      emailVerified: true,
      emailVerifiedAt: new Date()
    });

    // Clear attempts
    otpAttempts.delete(emailKey);
    otpCooldowns.delete(emailKey);

    res.json({ success: true, message: 'Email updated successfully' });

  } catch (error) {
    console.error('Email OTP verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new OTP.' });
    }
    res.status(500).json({ success: false, error: 'Failed to verify OTP' });
  }
};

// POST /api/auth/resend-email-otp
const resendEmailOTP = async (req, res) => {
  try {
    const { tempToken } = req.body;
    const emailKey = req.user.id + '_email';

    // Check cooldown
    if (otpCooldowns.has(emailKey)) {
      const cooldownEnd = otpCooldowns.get(emailKey);
      if (Date.now() < cooldownEnd) {
        const remainingTime = Math.ceil((cooldownEnd - Date.now()) / 1000);
        return res.status(429).json({ success: false, error: `Please wait ${remainingTime} seconds before resending OTP` });
      }
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== 'email-update') {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const newTempToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, otp, purpose: 'email-update' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Send new OTP email
    const emailSent = await sendEmailOTP(decoded.email, otp, 'Email Update');
    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Failed to resend OTP' });
    }

    // Reset attempts and set cooldown
    otpAttempts.set(emailKey, 0);
    otpCooldowns.set(emailKey, Date.now() + 30000); // 30 seconds cooldown

    res.json({ 
      success: true, 
      message: 'OTP resent successfully', 
      tempToken: newTempToken 
    });

  } catch (error) {
    console.error('Resend email OTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to resend OTP' });
  }
};

// POST /api/auth/update-password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ success: false, error: 'Incorrect password' });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, error: passwordValidation.message });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await updateUserById(user._id, { password: hashedNewPassword });

    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update password' });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ success: false, error: 'No account found with this email address' });
    }

    // Check OTP attempts
    const emailKey = user._id + '_forgot';
    if (otpAttempts.has(emailKey) && otpAttempts.get(emailKey) >= 5) {
      return res.status(429).json({ success: false, error: 'Too many OTP attempts. Please try again later.' });
    }

    // Check cooldown
    if (otpCooldowns.has(emailKey)) {
      const cooldownEnd = otpCooldowns.get(emailKey);
      if (Date.now() < cooldownEnd) {
        const remainingTime = Math.ceil((cooldownEnd - Date.now()) / 1000);
        return res.status(429).json({ success: false, error: `Please wait ${remainingTime} seconds before requesting OTP` });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const tempToken = jwt.sign(
      { userId: user._id, email: user.email, otp, purpose: 'forgot-password' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Send OTP email
    const emailSent = await sendEmailOTP(user.email, otp, 'Password Reset');
    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Failed to send OTP email' });
    }

    // Reset attempts and set cooldown
    otpAttempts.set(emailKey, 0);
    otpCooldowns.set(emailKey, Date.now() + 30000); // 30 seconds cooldown

    res.json({
      success: true,
      requiresOtp: true,
      tempToken,
      message: 'OTP sent to your email for password reset'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
};

// POST /api/auth/verify-forgot-password-otp
const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { tempToken, otp, newPassword } = req.body;
    const emailKey = req.user?.id + '_forgot' || 'unknown_forgot';

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== 'forgot-password') {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Check OTP attempts
    if (otpAttempts.has(emailKey) && otpAttempts.get(emailKey) >= 5) {
      return res.status(429).json({ success: false, error: 'Too many attempts. Please try again later.' });
    }

    if (decoded.otp !== otp) {
      const attempts = otpAttempts.get(emailKey) || 0;
      otpAttempts.set(emailKey, attempts + 1);
      
      const remainingAttempts = 5 - (attempts + 1);
      return res.status(400).json({ 
        success: false, 
        error: `Invalid OTP. ${remainingAttempts} attempts remaining` 
      });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ success: false, error: passwordValidation.message });
    }

    // Get user and update password
    const user = await getUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await updateUserById(user._id, { password: hashedNewPassword });

    // Clear attempts
    otpAttempts.delete(emailKey);
    otpCooldowns.delete(emailKey);

    res.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Forgot password OTP verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new OTP.' });
    }
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
};

// POST /api/auth/resend-forgot-password-otp
const resendForgotPasswordOTP = async (req, res) => {
  try {
    const { tempToken } = req.body;
    const emailKey = req.user?.id + '_forgot' || 'unknown_forgot';

    // Check cooldown
    if (otpCooldowns.has(emailKey)) {
      const cooldownEnd = otpCooldowns.get(emailKey);
      if (Date.now() < cooldownEnd) {
        const remainingTime = Math.ceil((cooldownEnd - Date.now()) / 1000);
        return res.status(429).json({ success: false, error: `Please wait ${remainingTime} seconds before resending OTP` });
      }
    }

    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded || decoded.purpose !== 'forgot-password') {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const newTempToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, otp, purpose: 'forgot-password' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    // Send new OTP email
    const emailSent = await sendEmailOTP(decoded.email, otp, 'Password Reset');
    if (!emailSent) {
      return res.status(500).json({ success: false, error: 'Failed to resend OTP' });
    }

    // Reset attempts and set cooldown
    otpAttempts.set(emailKey, 0);
    otpCooldowns.set(emailKey, Date.now() + 30000); // 30 seconds cooldown

    res.json({ 
      success: true, 
      message: 'OTP resent successfully', 
      tempToken: newTempToken 
    });

  } catch (error) {
    console.error('Resend forgot password OTP error:', error);
    res.status(500).json({ success: false, error: 'Failed to resend OTP' });
  }
};

// POST /api/auth/verify-password
const verifyPassword = async (req, res) => {
  try {
    const { password, email } = req.body;
    
    let user;
    
    // If email is provided, find by email (for initial verification)
    if (email) {
      user = await getUserByEmail(email);
    } 
    // If user is authenticated, get by ID
    else if (req.user && req.user.id) {
      user = await getUserById(req.user.id);
    }
    // If no user found, return error
    else {
      return res.status(400).json({ success: false, error: 'User identification required' });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Invalid password' });
    }

    res.json({ 
      success: true, 
      message: 'Password verified successfully',
      userId: user._id // Return user ID for frontend use
    });

  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify password' });
  }
};

// POST /api/auth/delete-account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, error: 'Invalid password' });
    }

    // Delete user from all role collections
    const roles = ['student', 'alumni', 'faculty', 'admin', 'coordinator'];
    for (const role of roles) {
      const Model = getModelByRole(role);
      try {
        await Model.findByIdAndDelete(user._id);
      } catch (error) {
        // Continue if user not found in this role
      }
    }

    res.json({ success: true, message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
};

module.exports = {
  updateEmail,
  verifyEmailOTP,
  resendEmailOTP,
  updatePassword,
  verifyPassword,
  deleteAccount,
  forgotPassword,
  verifyForgotPasswordOTP,
  resendForgotPasswordOTP,
};
