import pool from "../config/db.js";

async function createUsersTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        middle_name VARCHAR(50),
        last_name VARCHAR(50) NOT NULL,
        sex VARCHAR(10) CHECK (sex IN ('male', 'female', 'other')),
        birthdate DATE NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        pfp_path VARCHAR(500),
        verification_code VARCHAR(10),
        verification_expires TIMESTAMP,
        refresh_token_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query('COMMIT');
    console.log('✅ Users table created successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating users table:', error);
    throw error;
  } finally {
    client.release();
  }
}

createUsersTables().catch(console.error);

export default createUsersTables;