const nodemailer = require('nodemailer');

// Send contact form message
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, email, and message are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide a valid email address' 
      });
    }

    // Check if email is configured
    const emailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    
    if (emailConfigured) {
      try {
        // Create email transporter
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        // Email to admin
        const adminEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333; margin: 0;">New Contact Form Submission</h2>
                <p style="color: #666; margin: 5px 0;">APCOER Alumni Community</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h3 style="color: #333; margin: 0 0 15px 0;">Contact Details:</h3>
                <p style="color: #666; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                <p style="color: #666; margin: 5px 0;"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <div style="margin: 20px 0;">
                  <h4 style="color: #333; margin: 0 0 10px 0;">Message:</h4>
                  <p style="color: #666; background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 0;">
                    ${message}
                  </p>
                </div>
                <p style="color: #999; font-size: 12px; margin: 20px 0 0;">
                  Submitted on: ${new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        `;

        // Confirmation email to user
        const userEmailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #333; margin: 0;">Thank You for Contacting Us</h2>
                <p style="color: #666; margin: 5px 0;">APCOER Alumni Community</p>
              </div>
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <p style="color: #666; margin: 0 0 15px;">
                  Dear ${name},
                </p>
                <p style="color: #666; margin: 0 0 15px;">
                  Thank you for reaching out to APCOER Alumni Community. We have received your message and will get back to you shortly.
                </p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h4 style="color: #333; margin: 0 0 10px 0;">Your Message:</h4>
                  <p style="color: #666; margin: 0;">${message}</p>
                </div>
                <p style="color: #666; margin: 15px 0;">
                  If you have any urgent queries, please feel free to call us at:<br>
                  020-24218901 or 020-24218959
                </p>
                <p style="color: #666; margin: 15px 0;">
                  Best regards,<br>
                  APCOER Alumni Community Team
                </p>
              </div>
            </div>
          </div>
        `;

        // Send email to admin
        const adminMailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER, // Send to self (admin)
          subject: `New Contact Form: ${name}`,
          html: adminEmailContent
        };

        // Send confirmation email to user
        const userMailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Thank You for Contacting APCOER Alumni Community',
          html: userEmailContent
        };

        // Send both emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);

        console.log(`✅ Contact form email sent successfully from ${email}`);

      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue even if email fails
      }
    } else {
      // Log the message to console when email is not configured
      console.log('\n📧 NEW CONTACT FORM SUBMISSION');
      console.log('================================');
      console.log(`📅 Date: ${new Date().toLocaleString()}`);
      console.log(`👤 Name: ${name}`);
      console.log(`📧 Email: ${email}`);
      console.log(`📱 Phone: ${phone || 'Not provided'}`);
      console.log(`💬 Message: ${message}`);
      console.log('================================\n');
    }

    res.json({ 
      success: true, 
      message: 'Message sent successfully! We will get back to you soon.' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send message. Please try again later.' 
    });
  }
};

module.exports = {
  sendContactMessage
};
