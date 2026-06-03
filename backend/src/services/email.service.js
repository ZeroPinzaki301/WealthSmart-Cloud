import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,  // Your Brevo email
        pass: process.env.BREVO_SMTP_PASS   // The SMTP key you generated
      }
    });
    this.fromEmail = process.env.BREVO_FROM_EMAIL;  // Your verified sender email
  }
  
  async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"WealthSmart" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: html,
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to: ${to}`);
      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
  
  // Send verification code email
  async sendVerificationCode(email, username, code) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>Verify Your WealthSmart Account</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 20px 15px !important; }
            .main-card { padding: 20px !important; }
            .code-box { padding: 15px !important; }
            .code-digits { font-size: 28px !important; letter-spacing: 4px !important; padding: 12px !important; }
            .title { font-size: 22px !important; }
            .welcome-text { font-size: 18px !important; }
            .message-text { font-size: 14px !important; }
            .expiry-text { font-size: 11px !important; }
            .footer-text { font-size: 10px !important; }
            .feature-text { font-size: 13px !important; }
            .button { padding: 10px 20px !important; font-size: 14px !important; }
          }
          @media only screen and (max-width: 400px) {
            .code-digits { font-size: 22px !important; letter-spacing: 3px !important; padding: 10px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f0f; color: #e5e5e5;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 class="title" style="font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #00ff9d, #00b8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">
              WealthSmart
            </h1>
            <p style="color: #888888; margin-top: 8px; font-size: 14px;">Smart Financial Management</p>
          </div>
          
          <div class="main-card" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #2a2a2a; padding: 32px; margin-bottom: 24px;">
            <h2 class="welcome-text" style="color: #00ff9d; font-size: 24px; margin: 0 0 12px 0; word-wrap: break-word;">Welcome, ${username}! 👋</h2>
            <p class="message-text" style="color: #e5e5e5; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
              Thanks for joining WealthSmart! Please verify your email address to start managing your finances smartly.
            </p>
            
            <div class="code-box" style="background-color: #0f0f0f; border-radius: 8px; padding: 24px; text-align: center; border: 1px solid #2a2a2a; margin-bottom: 24px;">
              <p style="color: #888888; font-size: 14px; margin-bottom: 16px;">Your verification code is:</p>
              <div class="code-digits" style="font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #00ff9d; font-family: monospace; background-color: #0a0a0a; padding: 20px; border-radius: 8px; display: inline-block; max-width: 100%; word-break: break-all;">
                ${code}
              </div>
              <p class="expiry-text" style="color: #888888; font-size: 12px; margin-top: 16px;">
                This code will expire in <strong style="color: #e5e5e5;">30 minutes</strong>
              </p>
            </div>
            
            <p class="message-text" style="color: #888888; font-size: 14px; text-align: center;">
              Didn't request this? You can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #2a2a2a;">
            <p class="footer-text" style="color: #666666; font-size: 12px; margin: 0 0 8px 0;">
              WealthSmart - Take control of your finances
            </p>
            <p class="footer-text" style="color: #555555; font-size: 11px; margin: 0;">
              This is an automated message, please do not reply.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return this.sendEmail(email, 'Verify Your WealthSmart Account', html);
  }
  
  // Send welcome email after verification
  async sendWelcomeEmail(email, username) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>Welcome to WealthSmart</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 20px 15px !important; }
            .main-card { padding: 20px !important; }
            .title { font-size: 22px !important; }
            .welcome-text { font-size: 18px !important; }
            .message-text { font-size: 14px !important; }
            .feature-text { font-size: 13px !important; }
            .button { padding: 10px 20px !important; font-size: 14px !important; }
            .footer-text { font-size: 10px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f0f; color: #e5e5e5;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 class="title" style="font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #00ff9d, #00b8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">
              WealthSmart
            </h1>
          </div>
          
          <div class="main-card" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #2a2a2a; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 48px;">🎉</span>
            </div>
            <h2 class="welcome-text" style="color: #00ff9d; font-size: 24px; margin: 0 0 12px 0; text-align: center; word-wrap: break-word;">Welcome to WealthSmart, ${username}!</h2>
            <p class="message-text" style="color: #e5e5e5; font-size: 16px; line-height: 1.5; text-align: center; margin-bottom: 32px;">
              Your account has been successfully verified. You're now ready to take control of your financial future!
            </p>
            
            <div style="margin-bottom: 32px;">
              <div style="background-color: #0f0f0f; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #00ff9d;">
                <p class="feature-text" style="margin: 0; color: #e5e5e5; font-size: 14px;"><strong>💰 Track Expenses</strong> - Monitor where your money goes</p>
              </div>
              <div style="background-color: #0f0f0f; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #00b8ff;">
                <p class="feature-text" style="margin: 0; color: #e5e5e5; font-size: 14px;"><strong>📊 Smart Budgeting</strong> - Create and manage budgets</p>
              </div>
              <div style="background-color: #0f0f0f; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #00ff9d;">
                <p class="feature-text" style="margin: 0; color: #e5e5e5; font-size: 14px;"><strong>🎯 Financial Goals</strong> - Set and achieve your targets</p>
              </div>
            </div>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button" style="display: block; background: linear-gradient(135deg, #00ff9d, #00b8ff); color: #0f0f0f; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 8px; font-weight: 600; margin-top: 24px;">
              Get Started Now
            </a>
          </div>
          
          <div style="text-align: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid #2a2a2a;">
            <p class="footer-text" style="color: #666666; font-size: 12px;">
              WealthSmart - Smart Financial Management
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return this.sendEmail(email, 'Welcome to WealthSmart', html);
  }
  
  // Send password reset email
  async sendPasswordResetEmail(email, username, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>Reset Your Password</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 20px 15px !important; }
            .main-card { padding: 20px !important; }
            .title { font-size: 22px !important; }
            .reset-title { font-size: 20px !important; }
            .message-text { font-size: 14px !important; }
            .button { padding: 10px 20px !important; font-size: 14px !important; }
            .footer-text { font-size: 10px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f0f; color: #e5e5e5;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 class="title" style="font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #00ff9d, #00b8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">
              WealthSmart
            </h1>
          </div>
          
          <div class="main-card" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #2a2a2a; padding: 32px;">
            <h2 class="reset-title" style="color: #00b8ff; font-size: 24px; margin: 0 0 12px 0; word-wrap: break-word;">Reset Your Password</h2>
            <p class="message-text" style="color: #e5e5e5; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
              Hello ${username},
            </p>
            <p class="message-text" style="color: #e5e5e5; font-size: 16px; line-height: 1.5; margin-bottom: 32px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <a href="${resetUrl}" class="button" style="display: block; background: linear-gradient(135deg, #00b8ff, #0088cc); color: #0f0f0f; text-decoration: none; text-align: center; padding: 14px 24px; border-radius: 8px; font-weight: 600;">
              Reset Password
            </a>
            
            <p class="message-text" style="color: #888888; font-size: 14px; text-align: center; margin-top: 24px;">
              This link will expire in <strong style="color: #e5e5e5;">1 hour</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 24px 0;">
            
            <p class="message-text" style="color: #666666; font-size: 13px; text-align: center;">
              If you didn't request this, please ignore this email and ensure your account is secure.
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 24px;">
            <p class="footer-text" style="color: #555555; font-size: 11px;">
              WealthSmart - Smart Financial Management
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return this.sendEmail(email, 'Reset Your WealthSmart Password', html);
  }
  
  // Send password change confirmation
  async sendPasswordChangeConfirmation(email, username) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
        <title>Password Changed</title>
        <style>
          @media only screen and (max-width: 600px) {
            .container { padding: 20px 15px !important; }
            .main-card { padding: 20px !important; }
            .title { font-size: 22px !important; }
            .message-text { font-size: 14px !important; }
            .footer-text { font-size: 10px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f0f0f; color: #e5e5e5;">
        <div class="container" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 class="title" style="font-size: 28px; font-weight: bold; background: linear-gradient(135deg, #00ff9d, #00b8ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">
              WealthSmart
            </h1>
          </div>
          
          <div class="main-card" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #2a2a2a; padding: 32px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
            <h2 style="color: #00ff9d; font-size: 24px; margin: 0 0 12px 0; word-wrap: break-word;">Password Changed Successfully</h2>
            <p class="message-text" style="color: #e5e5e5; font-size: 16px; line-height: 1.5;">
              Hello ${username},
            </p>
            <p class="message-text" style="color: #e5e5e5; font-size: 16px; line-height: 1.5;">
              Your password has been changed successfully.
            </p>
            <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 24px 0;">
            <p class="message-text" style="color: #666666; font-size: 13px;">
              If you did not make this change, please contact support immediately.
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 24px;">
            <p class="footer-text" style="color: #555555; font-size: 11px;">
              WealthSmart - Smart Financial Management
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return this.sendEmail(email, 'Your Password Has Been Changed', html);
  }
}

export default new EmailService();