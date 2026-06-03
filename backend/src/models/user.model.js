import pool from "../config/db.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class UserModel {
  static async query(sql, params) {
    return pool.query(sql, params);
  }

  static async emailExists(email) {
    const query = 'SELECT 1 FROM users WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows.length > 0;
  }
  
  static async usernameExists(username) {
    const query = 'SELECT 1 FROM users WHERE username = $1';
    const result = await pool.query(query, [username.toLowerCase()]);
    return result.rows.length > 0;
  }
  
  static async create(userData) {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000);
    
    const query = `
      INSERT INTO users (
        id, username, email, password_hash, first_name, middle_name, 
        last_name, sex, birthdate, verification_code, verification_expires, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, username, email, first_name, middle_name, last_name, sex, birthdate
    `;
    
    const values = [
      userId,
      userData.username.toLowerCase(),
      userData.email.toLowerCase(),
      passwordHash,
      userData.first_name,
      userData.middle_name || null,
      userData.last_name,
      userData.sex,
      userData.birthdate,
      verificationCode,
      verificationExpires
    ];
    
    const result = await pool.query(query, values);
    return { ...result.rows[0], verificationCode, verificationExpires };
  }
  
  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }
  
  static async findById(id) {
    // Removed last_login - no migration needed
    const query = `SELECT id, username, email, first_name, middle_name, last_name, 
                   sex, birthdate, is_verified, pfp_path, created_at 
                   FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }
  
  static async verifyUser(email, code) {
    const query = `
      UPDATE users 
      SET is_verified = true, 
          verification_code = NULL,
          verification_expires = NULL
      WHERE email = $1 
        AND verification_code = $2 
        AND verification_expires > CURRENT_TIMESTAMP
      RETURNING id, email, username, is_verified
    `;
    const result = await pool.query(query, [email.toLowerCase(), code]);
    return result.rows[0] || null;
  }
  
  static async updateVerificationCode(email) {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000);
    
    const query = `
      UPDATE users 
      SET verification_code = $1, verification_expires = $2
      WHERE email = $3
      RETURNING verification_code, verification_expires
    `;
    const result = await pool.query(query, [verificationCode, verificationExpires, email.toLowerCase()]);
    return result.rows[0];
  }
  
  static async updateRefreshToken(userId, refreshToken) {
    const query = `UPDATE users SET refresh_token_hash = $1 WHERE id = $2`;
    await pool.query(query, [refreshToken, userId]);
  }
  
  static async clearRefreshToken(userId) {
    const query = `UPDATE users SET refresh_token_hash = NULL WHERE id = $1`;
    await pool.query(query, [userId]);
  }
  
  // Update user profile
  static async update(userId, updateData) {
    const allowedFields = ['first_name', 'middle_name', 'last_name', 'sex', 'pfp_path'];
    const updates = [];
    const values = [];
    let valueIndex = 1;
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = $${valueIndex}`);
        values.push(updateData[field]);
        valueIndex++;
      }
    }
    
    if (updates.length === 0) return null;
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);
    
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING id, username, email, first_name, middle_name, last_name, sex, pfp_path, updated_at
    `;
    
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}

export default UserModel;