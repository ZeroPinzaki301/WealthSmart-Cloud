import pool from "../config/db.js";

class BudgetEstimationModel {
  // Check if table exists
  static async checkTableExists() {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'budget_estimations'
      );
    `;
    const result = await pool.query(query);
    return result.rows[0].exists;
  }

  // Create a new budget estimation entry (with user_id)
  static async create(estimationData, userId = null) {
    try {
      const { name, description, expenses, span, currentBudget } = estimationData;
      const query = `
        INSERT INTO budget_estimations (name, description, expenses, span, current_budget, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;
      const values = [name, description, JSON.stringify(expenses), JSON.stringify(span), currentBudget || null, userId];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '42P01') {
        console.error('Budget estimations table does not exist. Please run the database migration.');
        return null;
      }
      throw error;
    }
  }

  // Get all budget estimations (admin use)
  static async findAll() {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      const query = `
        SELECT * FROM budget_estimations 
        ORDER BY created_at DESC
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

  // Get budget estimations for a specific user
  static async findAllByUser(userId) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      const query = `
        SELECT * FROM budget_estimations 
        WHERE user_id = $1
        ORDER BY created_at DESC
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

  // Get budget estimation by ID (with optional user check)
  static async findById(id, userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return null;
      }
      
      let query = `SELECT * FROM budget_estimations WHERE id = $1`;
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

  // Get budget estimations by name (partial match) for a specific user
  static async findByName(searchTerm, userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      let query = `
        SELECT * FROM budget_estimations 
        WHERE name ILIKE $1
      `;
      let values = [`%${searchTerm}%`];
      
      if (userId) {
        query += ` AND user_id = $2`;
        values.push(userId);
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }
  }

  // Update budget estimation (with optional user ownership check)
  static async update(id, estimationData, userId = null) {
    try {
      const { name, description, expenses, span, currentBudget } = estimationData;
      
      let query = `
        UPDATE budget_estimations 
        SET name = $1, description = $2, expenses = $3, span = $4, current_budget = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `;
      let values = [name, description, JSON.stringify(expenses), JSON.stringify(span), currentBudget || null, id];
      
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

  // Delete budget estimation (with optional user ownership check)
  static async delete(id, userId = null) {
    try {
      let query = `DELETE FROM budget_estimations WHERE id = $1`;
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

  // Calculate total estimated expenses (with optional user check)
  static async calculateTotalExpenses(id, userId = null) {
    try {
      const estimation = await this.findById(id, userId);
      if (!estimation) return null;
      
      const expenses = Array.isArray(estimation.expenses) ? estimation.expenses : JSON.parse(estimation.expenses);
      const total = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      
      return {
        id: estimation.id,
        name: estimation.name,
        total_expenses: total
      };
    } catch (error) {
      if (error.code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  // Calculate total weighted days (with optional user check)
  static async calculateTotalWeightedDays(id, userId = null) {
    try {
      const estimation = await this.findById(id, userId);
      if (!estimation) return null;
      
      const expenses = Array.isArray(estimation.expenses) ? estimation.expenses : JSON.parse(estimation.expenses);
      const span = Array.isArray(estimation.span) ? estimation.span : JSON.parse(estimation.span);
      
      const totalSpanDays = span.reduce((sum, period) => sum + (parseInt(period.no_of_days) || 0), 0);
      const totalExpenseDays = expenses.reduce((sum, expense) => sum + (parseInt(expense.days_span) || 0), 0);
      
      return {
        id: estimation.id,
        name: estimation.name,
        total_span_days: totalSpanDays,
        total_expense_days: totalExpenseDays,
        max_days: Math.max(totalSpanDays, totalExpenseDays)
      };
    } catch (error) {
      if (error.code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  // Calculate daily budget requirement (with optional user check)
  static async calculateDailyBudget(id, userId = null) {
    try {
      const estimation = await this.findById(id, userId);
      if (!estimation) return null;
      
      const expenses = Array.isArray(estimation.expenses) ? estimation.expenses : JSON.parse(estimation.expenses);
      const span = Array.isArray(estimation.span) ? estimation.span : JSON.parse(estimation.span);
      
      const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
      const totalSpanDays = span.reduce((sum, period) => sum + (parseInt(period.no_of_days) || 0), 0);
      
      const expenseDailyBreakdown = expenses.map(expense => ({
        name: expense.name,
        amount: expense.amount,
        days_span: expense.days_span,
        daily_cost: expense.days_span > 0 ? expense.amount / expense.days_span : 0
      }));
      
      const overallDailyBudget = totalSpanDays > 0 ? totalExpenses / totalSpanDays : 0;
      const currentBudget = parseFloat(estimation.current_budget) || 0;
      const budgetGap = currentBudget - totalExpenses;
      
      return {
        id: estimation.id,
        name: estimation.name,
        total_expenses: totalExpenses,
        total_span_days: totalSpanDays,
        overall_daily_budget: overallDailyBudget,
        expense_daily_breakdown: expenseDailyBreakdown,
        current_budget: currentBudget,
        budget_gap: budgetGap,
        is_budget_sufficient: currentBudget >= totalExpenses
      };
    } catch (error) {
      if (error.code === '42P01') {
        return null;
      }
      throw error;
    }
  }

  // Get summary of all estimations for a user
  static async getSummary(userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return {
          total_estimations: 0,
          total_budget_required: 0,
          total_current_budget: 0,
          total_budget_gap: 0,
          average_daily_budget: 0
        };
      }
      
      let estimations;
      if (userId) {
        estimations = await this.findAllByUser(userId);
      } else {
        estimations = await this.findAll();
      }
      
      let totalBudgetRequired = 0;
      let totalCurrentBudget = 0;
      let totalDays = 0;
      
      for (const estimation of estimations) {
        const expenses = Array.isArray(estimation.expenses) ? estimation.expenses : JSON.parse(estimation.expenses);
        const span = Array.isArray(estimation.span) ? estimation.span : JSON.parse(estimation.span);
        
        const budgetRequired = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
        const days = span.reduce((sum, period) => sum + (parseInt(period.no_of_days) || 0), 0);
        
        totalBudgetRequired += budgetRequired;
        totalCurrentBudget += parseFloat(estimation.current_budget) || 0;
        totalDays += days;
      }
      
      return {
        total_estimations: estimations.length,
        total_budget_required: totalBudgetRequired,
        total_current_budget: totalCurrentBudget,
        total_budget_gap: totalCurrentBudget - totalBudgetRequired,
        average_daily_budget: totalDays > 0 ? totalBudgetRequired / totalDays : 0
      };
    } catch (error) {
      if (error.code === '42P01') {
        return {
          total_estimations: 0,
          total_budget_required: 0,
          total_current_budget: 0,
          total_budget_gap: 0,
          average_daily_budget: 0
        };
      }
      throw error;
    }
  }

  // Get estimations with budget alerts for a user
  static async getBudgetAlerts(userId = null) {
    try {
      const tableExists = await this.checkTableExists();
      if (!tableExists) {
        return [];
      }
      
      let estimations;
      if (userId) {
        estimations = await this.findAllByUser(userId);
      } else {
        estimations = await this.findAll();
      }
      
      const alerts = [];
      
      for (const estimation of estimations) {
        const expenses = Array.isArray(estimation.expenses) ? estimation.expenses : JSON.parse(estimation.expenses);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
        const currentBudget = parseFloat(estimation.current_budget) || 0;
        
        if (currentBudget < totalExpenses) {
          alerts.push({
            ...estimation,
            budget_shortfall: totalExpenses - currentBudget,
            alert_level: currentBudget === 0 ? 'critical' : (currentBudget < totalExpenses / 2 ? 'high' : 'warning')
          });
        }
      }
      
      return alerts;
    } catch (error) {
      if (error.code === '42P01') {
        return [];
      }
      throw error;
    }
  }
}

export default BudgetEstimationModel;