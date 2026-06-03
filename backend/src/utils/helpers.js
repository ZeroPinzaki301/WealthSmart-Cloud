import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generate unique user ID (YYYYMMDD-XXXX)
export async function generateUserId(checkExistsFn) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const userId = `${datePrefix}-${randomNum}`;
    
    const exists = await checkExistsFn(userId);
    if (!exists) return userId;
    attempts++;
  }
  throw new Error('Failed to generate unique user ID');
}

// Hash a token (for storing in DB)
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate random token
export function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Validate password strength
export function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitize user input
export function sanitizeUserInput(data) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Remove HTML tags and trim
      sanitized[key] = value.trim().replace(/<[^>]*>/g, '');
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Calculate age from birthdate
export function calculateAge(birthdate) {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}