import pool from "../config/db.js";

async function addUserIdToBudgets() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Check if user_id column exists
    const checkColumn = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'budgets' AND column_name = 'user_id'
      );
    `);
    
    if (!checkColumn.rows[0].exists) {
      // Add user_id column
      await client.query(`
        ALTER TABLE budgets 
        ADD COLUMN user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE
      `);
      
      // Create index for better query performance
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id)
      `);
      
      console.log('✅ Added user_id column to budgets table');
    } else {
      console.log('ℹ️ user_id column already exists');
    }
    
    await client.query('COMMIT');
    console.log('✅ Migration completed successfully');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding user_id to budgets:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration
addUserIdToBudgets().catch(console.error);

export default addUserIdToBudgets;