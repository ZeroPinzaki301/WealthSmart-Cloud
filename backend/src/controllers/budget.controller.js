import BudgetModel from "../models/budget.model.js";

class BudgetController {
  // Create a new budget entry (user-specific)
  static async createBudget(req, res) {
    try {
      const { amount, name, description, budget_date, is_income } = req.body;
      const userId = req.userId;
      
      console.log('=== CREATE BUDGET DEBUG ===');
      console.log('userId from token:', userId);
      console.log('Request body:', req.body);
      
      // Check if user is authenticated
      if (!userId) {
        console.error('No userId found in request - user not authenticated');
        return res.status(401).json({ 
          error: "User not authenticated. Please login again." 
        });
      }
      
      // Validation
      if (!amount || !name || !budget_date) {
        return res.status(400).json({ 
          error: "Missing required fields: amount, name, and budget_date are required" 
        });
      }

      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ 
          error: "Amount must be a positive number" 
        });
      }

      const budgetData = {
        amount: parseFloat(amount),
        name: name.trim(),
        description: description ? description.trim() : null,
        budget_date,
        is_income: is_income === true || is_income === 'true' ? true : false
      };

      console.log('Processed budgetData:', budgetData);
      console.log('Calling BudgetModel.create with userId:', userId);

      const newBudget = await BudgetModel.create(budgetData, userId);
      
      if (!newBudget) {
        return res.status(500).json({ 
          error: "Database table not ready. Please run database migrations." 
        });
      }
      
      console.log('Budget created successfully:', newBudget);
      
      res.status(201).json({ 
        success: true, 
        message: "Budget entry created successfully", 
        data: newBudget 
      });
    } catch (error) {
      console.error("=== ERROR CREATING BUDGET ===");
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error detail:", error.detail);
      console.error("Error stack:", error.stack);
      
      // Send more specific error messages based on the error
      if (error.code === '23503') { // Foreign key violation
        return res.status(400).json({ 
          error: "Invalid user. Please login again." 
        });
      }
      
      if (error.code === '23502') { // Not null violation
        return res.status(400).json({ 
          error: "Missing required field: " + error.column 
        });
      }
      
      if (error.code === '42P01') { // Table doesn't exist
        return res.status(500).json({ 
          error: "Database table not ready. Please contact support." 
        });
      }
      
      res.status(500).json({ 
        error: "Internal server error: " + (error.message || "Unknown error") 
      });
    }
  }

  // Get all budget entries for the logged-in user
  static async getUserBudgets(req, res) {
    try {
      const userId = req.userId;
      const budgets = await BudgetModel.findAllByUser(userId);
      res.status(200).json({ 
        success: true, 
        count: budgets.length, 
        data: budgets 
      });
    } catch (error) {
      console.error("Error fetching user budgets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all budget entries (admin only - keep for future use)
  static async getAllBudgets(req, res) {
    try {
      // TODO: Add admin role check here in the future
      // For now, return unauthorized unless explicitly needed
      const budgets = await BudgetModel.findAll();
      res.status(200).json({ 
        success: true, 
        count: budgets.length, 
        data: budgets 
      });
    } catch (error) {
      console.error("Error fetching all budgets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get budget by ID (with user ownership check)
  static async getBudgetById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      const budget = await BudgetModel.findById(id, userId);

      if (!budget) {
        return res.status(404).json({ error: "Budget entry not found" });
      }

      res.status(200).json({ success: true, data: budget });
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get budgets by date range for logged-in user
  static async getUserBudgetsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.userId;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "Missing required query parameters: startDate and endDate" 
        });
      }

      const budgets = await BudgetModel.findByDateRange(startDate, endDate, userId);
      res.status(200).json({ 
        success: true, 
        count: budgets.length, 
        data: budgets 
      });
    } catch (error) {
      console.error("Error fetching budgets by date range:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get budgets by date range (admin - keep for future)
  static async getAllBudgetsByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ 
          error: "Missing required query parameters: startDate and endDate" 
        });
      }

      const budgets = await BudgetModel.findByDateRange(startDate, endDate);
      res.status(200).json({ 
        success: true, 
        count: budgets.length, 
        data: budgets 
      });
    } catch (error) {
      console.error("Error fetching all budgets by date range:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get budgets by type for logged-in user
  static async getUserBudgetsByType(req, res) {
    try {
      const { type } = req.params;
      const userId = req.userId;
      
      let is_income;
      if (type === "income") {
        is_income = true;
      } else if (type === "expense") {
        is_income = false;
      } else {
        return res.status(400).json({ 
          error: "Invalid type. Use 'income' or 'expense'" 
        });
      }

      const budgets = await BudgetModel.findByType(is_income, userId);
      res.status(200).json({ 
        success: true, 
        count: budgets.length, 
        data: budgets 
      });
    } catch (error) {
      console.error("Error fetching budgets by type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update budget entry (with user ownership check)
  static async updateBudget(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const { amount, name, description, budget_date, is_income } = req.body;

      // Check if budget exists and belongs to user
      const existingBudget = await BudgetModel.findById(id, userId);
      if (!existingBudget) {
        return res.status(404).json({ error: "Budget entry not found" });
      }

      // Validation
      if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
        return res.status(400).json({ 
          error: "Amount must be a positive number" 
        });
      }

      const budgetData = {
        amount: amount !== undefined ? amount : existingBudget.amount,
        name: name || existingBudget.name,
        description: description !== undefined ? description : existingBudget.description,
        budget_date: budget_date || existingBudget.budget_date,
        is_income: is_income !== undefined ? is_income : existingBudget.is_income
      };

      const updatedBudget = await BudgetModel.update(id, budgetData, userId);
      
      if (!updatedBudget) {
        return res.status(500).json({ error: "Failed to update budget" });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Budget entry updated successfully", 
        data: updatedBudget 
      });
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Delete budget entry (with user ownership check)
  static async deleteBudget(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      // Check if budget exists and belongs to user
      const existingBudget = await BudgetModel.findById(id, userId);
      if (!existingBudget) {
        return res.status(404).json({ error: "Budget entry not found" });
      }

      const deleted = await BudgetModel.delete(id, userId);
      
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete budget" });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Budget entry deleted successfully",
        data: existingBudget 
      });
    } catch (error) {
      console.error("Error deleting budget:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get summary for logged-in user
  static async getUserSummary(req, res) {
    try {
      const userId = req.userId;
      const summary = await BudgetModel.getSummary(userId);
      res.status(200).json({ 
        success: true, 
        data: {
          total_income: parseFloat(summary.total_income || 0),
          total_expenses: parseFloat(summary.total_expenses || 0),
          balance: parseFloat(summary.balance || 0)
        }
      });
    } catch (error) {
      console.error("Error getting user summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get summary (admin - keep for future)
  static async getAllSummary(req, res) {
    try {
      const summary = await BudgetModel.getSummary();
      res.status(200).json({ 
        success: true, 
        data: {
          total_income: parseFloat(summary.total_income || 0),
          total_expenses: parseFloat(summary.total_expenses || 0),
          balance: parseFloat(summary.balance || 0)
        }
      });
    } catch (error) {
      console.error("Error getting all summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get monthly summary for logged-in user
  static async getUserMonthlySummary(req, res) {
    try {
      const { year, month } = req.params;
      const userId = req.userId;

      if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({ 
          error: "Invalid year or month. Month must be between 1 and 12" 
        });
      }

      const summary = await BudgetModel.getMonthlySummary(year, month, userId);
      res.status(200).json({ 
        success: true, 
        data: {
          year: parseInt(year),
          month: parseInt(month),
          total_income: parseFloat(summary.total_income || 0),
          total_expenses: parseFloat(summary.total_expenses || 0),
          balance: parseFloat(summary.balance || 0)
        }
      });
    } catch (error) {
      console.error("Error getting user monthly summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default BudgetController;