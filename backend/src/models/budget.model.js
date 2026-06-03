import pool from "../config/db.js";

class BudgetModel {
  // Check if table exists
  static async checkTableExists() {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'budgets'
      );
    `;
    const result = await pool.query(query);
    return result.rows[0].exists;
  }

  // Create a new budget entry (with user_id)
  static async create(budgetData, userId = null) {
    try {
      const { amount, name, description, budget_date, is_income } = budgetData;
      
      console.log('📝 BudgetModel.create - Input:', { budgetData, userId });
      
      // Validate required fields
      if (!amount || !name || !budget_date) {
        throw new Error('Missing required fields: amount, name, budget_date');
      }
      
      const query = `
        INSERT INTO budgets (amount, name, description, budget_date, is_income, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const values = [amount, name, description || null, budget_date, is_income || false, userId];
      
      console.log('📝 BudgetModel.create - Query:', query);
      console.log('📝 BudgetModel.create - Values:', values);
      
      const result = await pool.query(query, values);
      console.log('✅ BudgetModel.create - Success:', result.rows[0]);
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ BudgetModel.create - Error details:');
      console.error('  - Code:', error.code);
      console.error('  - Message:', error.message);
      console.error('  - Detail:', error.detail);
      console.error('  - Table:', error.table);
      console.error('  - Column:', error.column);
      throw error; // Re-throw to let controller handle it
    }
  }
  // Get all budget entries (admin/superuser use)
  static async findAll() {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      const query = `
        SELECT * FROM budgets 
        ORDER BY budget_date DESC, created_at DESC
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }
  }

  // Get budget entries for a specific user
  static async findAllByUser(userId) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      const query = `
        SELECT * FROM budgets 
        WHERE user_id = $1
        ORDER BY budget_date DESC, created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }
  }

  // Get budget entry by ID (with optional user check)
  static async findById(id, userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return null;
      }
      
      let query = `SELECT * FROM budgets WHERE id = $1`;
      let values = [id];
      
      if (userId) {
        query += ` AND user_id = $2`;
        values.push(userId);
      }
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  // Get budget entries by date range for a specific user
  static async findByDateRange(startDate, endDate, userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      let query = `
        SELECT * FROM budgets 
        WHERE budget_date BETWEEN $1 AND $2
      `;
      let values = [startDate, endDate];
      
      if (userId) {
        query += ` AND user_id = $3`;
        values.push(userId);
      }
      
      query += ` ORDER BY budget_date DESC`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }
  }

  // Get budget entries by type for a specific user
  static async findByType(is_income, userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      let query = `
        SELECT * FROM budgets 
        WHERE is_income = $1
      `;
      let values = [is_income];
      
      if (userId) {
        query += ` AND user_id = $2`;
        values.push(userId);
      }
      
      query += ` ORDER BY budget_date DESC`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }
  }

  // Update budget entry (with optional user ownership check)
  static async update(id, budgetData, userId = null) {
    try {
      const { amount, name, description, budget_date, is_income } = budgetData;
      
      let query = `
        UPDATE budgets 
        SET amount = $1, name = $2, description = $3, budget_date = $4, is_income = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `;
      let values = [amount, name, description, budget_date, is_income, id];
      
      if (userId) {
        query += ` AND user_id = $7`;
        values.push(userId);
      }
      
      query += ` RETURNING *`;
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  // Delete budget entry (with optional user ownership check)
  static async delete(id, userId = null) {
    try {
      let query = `DELETE FROM budgets WHERE id = $1`;
      let values = [id];
      
      if (userId) {
        query += ` AND user_id = $2`;
        values.push(userId);
      }
      
      query += ` RETURNING *`;
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  // Get summary for a specific user
  static async getSummary(userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return {
          total_income: 0,
          total_expenses: 0,
          balance: 0
        };
      }
      
      let query = `
        SELECT 
          COALESCE(SUM(CASE WHEN is_income = true THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN is_income = false THEN amount ELSE 0 END), 0) as total_expenses,
          COALESCE(SUM(CASE WHEN is_income = true THEN amount ELSE -amount END), 0) as balance
        FROM budgets
      `;
      let values = [];
      
      if (userId) {
        query += ` WHERE user_id = $1`;
        values.push(userId);
      }
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '42P01') {
        return {
          total_income: 0,
          total_expenses: 0,
          balance: 0
        };
      }
      throw error;
    }
  }

  // Get monthly summary for a specific user
  static async getMonthlySummary(year, month, userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return {
          total_income: 0,
          total_expenses: 0,
          balance: 0
        };
      }
      
      let query = `
        SELECT 
          COALESCE(SUM(CASE WHEN is_income = true THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN is_income = false THEN amount ELSE 0 END), 0) as total_expenses,
          COALESCE(SUM(CASE WHEN is_income = true THEN amount ELSE -amount END), 0) as balance
        FROM budgets
        WHERE EXTRACT(YEAR FROM budget_date) = $1 
          AND EXTRACT(MONTH FROM budget_date) = $2
      `;
      let values = [year, month];
      
      if (userId) {
        query += ` AND user_id = $3`;
        values.push(userId);
      }
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '42P01') {
        return {
          total_income: 0,
          total_expenses: 0,
          balance: 0
        };
      }
      throw error;
    }
  }
}

export default BudgetModel;