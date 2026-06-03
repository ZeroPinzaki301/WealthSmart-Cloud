import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

// Function to create tables if they don't exist
async function initializeDatabase() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      amount DECIMAL(10, 2) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      budget_date DATE NOT NULL,
      is_income BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_budgets_budget_date ON budgets(budget_date);
    CREATE INDEX IF NOT EXISTS idx_budgets_is_income ON budgets(is_income);
    CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON budgets(created_at);
  `;
  
  try {
    const client = await pool.connect();
    await client.query(createTableSQL);
    console.log("✅ Database tables created/verified successfully");
    client.release();
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  }
}

// Initialize database when server starts
initializeDatabase();

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Successfully connected to Supabase Transaction Pooler!");
    release();
  }
});

export default pool;