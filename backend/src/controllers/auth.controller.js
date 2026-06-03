import UserModel from '../models/user.model.js';
import EmailService from '../services/email.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class AuthController {
  // Generate JWT tokens
  static generateTokens(userId, email, username) {
    const accessToken = jwt.sign(
      { userId, email, username },
      process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    const refreshToken = crypto.randomBytes(64).toString('hex');
    
    return { accessToken, refreshToken };
  }
  
  // Register new user
  static async register(req, res) {
    try {
      const { email, username, password, first_name, middle_name, last_name, sex, birthdate } = req.body;
      
      // Check if email exists
      const emailExists = await UserModel.emailExists(email);
      if (emailExists) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      // Check if username exists
      const usernameExists = await UserModel.usernameExists(username);
      if (usernameExists) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Create user
      const newUser = await UserModel.create({
        email, username, password, first_name, middle_name, last_name, sex, birthdate
      });
      
      // Send verification email with code
      await EmailService.sendVerificationCode(newUser.email, newUser.username, newUser.verificationCode);
      
      res.status(201).json({
        message: 'Registration successful. Please check your email for verification code.',
        email: newUser.email,
        verificationExpires: newUser.verificationExpires
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message || 'Registration failed' });
    }
  }
  
  // Verify email with code
  static async verifyEmail(req, res) {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: 'Email and verification code are required' });
      }
      
      const user = await UserModel.verifyUser(email, code);
      
      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired verification code. Please request a new code.' 
        });
      }
      
      res.json({ 
        message: 'Email verified successfully! You can now login.',
        is_verified: true 
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Failed to verify email' });
    }
  }
  
  // Resend verification code
  static async resendVerification(req, res) {
    try {
      const { email } = req.body;
      
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.is_verified) {
        return res.status(400).json({ message: 'Email already verified' });
      }
      
      // Check if verification is still valid (within 30 minutes)
      if (user.verification_expires && new Date(user.verification_expires) > new Date()) {
        return res.status(400).json({ 
          message: 'Verification code still valid. Please check your email or wait for it to expire.',
          expiresAt: user.verification_expires
        });
      }
      
      // Generate new verification code
      const updated = await UserModel.updateVerificationCode(email);
      
      // Send new verification email
      await EmailService.sendVerificationCode(user.email, user.username, updated.verification_code);
      
      res.json({ 
        message: 'New verification code sent to your email.',
        expiresAt: updated.verification_expires
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ message: 'Failed to resend verification code' });
    }
  }
  
  // Login user - UPDATED to accept email OR username
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const loginIdentifier = email; // This can be either email OR username
      
      // Find user by email OR username
      const query = `
        SELECT id, email, username, password_hash, is_verified, 
               first_name, last_name, verification_expires
        FROM users 
        WHERE email = $1 OR username = $1
      `;
      const result = await UserModel.query(query, [loginIdentifier.toLowerCase()]);
      const user = result.rows[0];
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if verified
      if (!user.is_verified) {
        return res.status(403).json({ 
          message: 'Email not verified. Please verify your email first.',
          needsVerification: true,
          email: user.email,
          verificationExpires: user.verification_expires
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate tokens
      const { accessToken, refreshToken } = AuthController.generateTokens(user.id, user.email, user.username);
      
      // Store refresh token (hashed)
      const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await UserModel.updateRefreshToken(user.id, hashedRefreshToken);
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        message: 'Login successful',
        accessToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          is_verified: user.is_verified
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  }
  
  // Refresh access token
  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
      }
      
      const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // Find user with this refresh token
      const query = `SELECT id, email, username FROM users WHERE refresh_token_hash = $1`;
      const result = await UserModel.query(query, [hashedRefreshToken]);
      
      if (result.rows.length === 0) {
        res.clearCookie('refreshToken');
        return res.status(401).json({ message: 'Invalid refresh token' });
      }
      
      const user = result.rows[0];
      
      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = AuthController.generateTokens(user.id, user.email, user.username);
      const newHashedRefreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
      
      // Update refresh token in database
      await UserModel.updateRefreshToken(user.id, newHashedRefreshToken);
      
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.clearCookie('refreshToken');
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
  
  // Logout
  static async logout(req, res) {
    try {
      if (req.userId) {
        await UserModel.clearRefreshToken(req.userId);
      }
      
      res.clearCookie('refreshToken');
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Logout failed' });
    }
  }
  
  // Get current user
  static async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Failed to get user profile' });
    }
  }
}

export default AuthController;