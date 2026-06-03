import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

export const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('sex').isIn(['male', 'female', 'other']),
  body('birthdate').isISO8601().withMessage('Valid birthdate is required'),
  handleValidationErrors
];

// UPDATED: Login validation - accepts email OR username
export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email or username is required')
    .custom((value) => {
      // Check if it's an email
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      // Check if it's a valid username (letters, numbers, underscore, 3-50 chars)
      const isUsername = /^[a-zA-Z0-9_]{3,50}$/.test(value);
      
      if (!isEmail && !isUsername) {
        throw new Error('Must be a valid email address or username (3-50 characters, letters, numbers, underscores only)');
      }
      return true;
    }),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateVerification = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('code').isLength({ min: 6, max: 6 }).matches(/^\d+$/).withMessage('Verification code must be 6 digits'),
  handleValidationErrors
];