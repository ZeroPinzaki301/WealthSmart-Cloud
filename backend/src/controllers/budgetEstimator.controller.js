import BudgetEstimationModel from "../models/budgetEstimator.model.js";

class BudgetEstimatorController {
  // Create a new budget estimation (user-specific)
  static async createEstimation(req, res) {
    try {
      const { name, description, expenses, span, currentBudget } = req.body;
      const userId = req.userId;
      
      // Check authentication
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name is required" });
      }

      if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
        return res.status(400).json({ error: "Expenses array is required and must contain at least one expense" });
      }

      // Validate each expense
      for (const expense of expenses) {
        if (!expense.name || !expense.amount || !expense.days_span) {
          return res.status(400).json({ error: "Each expense must have a name, amount, and days_span" });
        }
        if (isNaN(expense.amount) || expense.amount <= 0) {
          return res.status(400).json({ error: `Expense amount for "${expense.name}" must be a positive number` });
        }
        if (isNaN(expense.days_span) || expense.days_span <= 0) {
          return res.status(400).json({ error: `Days span for "${expense.name}" must be a positive number` });
        }
      }

      if (!span || !Array.isArray(span) || span.length === 0) {
        return res.status(400).json({ error: "Span array is required and must contain at least one time period" });
      }

      for (const period of span) {
        if (!period.name || !period.no_of_days) {
          return res.status(400).json({ error: "Each span period must have a name and number of days" });
        }
        if (isNaN(period.no_of_days) || period.no_of_days <= 0) {
          return res.status(400).json({ error: `Number of days for "${period.name}" must be a positive number` });
        }
      }

      if (currentBudget !== undefined && currentBudget !== null) {
        if (isNaN(currentBudget) || currentBudget < 0) {
          return res.status(400).json({ error: "Current budget must be a positive number" });
        }
      }

      const estimationData = {
        name: name.trim(),
        description: description || null,
        expenses,
        span,
        currentBudget: currentBudget || null
      };

      const newEstimation = await BudgetEstimationModel.create(estimationData, userId);
      
      if (!newEstimation) {
        return res.status(500).json({ error: "Database table not ready. Please run database migrations." });
      }
      
      // Calculate additional info for response
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalSpanDays = span.reduce((sum, period) => sum + period.no_of_days, 0);
      const overallDailyBudget = totalSpanDays > 0 ? totalExpenses / totalSpanDays : 0;
      
      const expenseBreakdown = expenses.map(expense => ({
        name: expense.name,
        amount: expense.amount,
        days_span: expense.days_span,
        daily_cost: expense.days_span > 0 ? expense.amount / expense.days_span : 0
      }));
      
      res.status(201).json({ 
        success: true, 
        message: "Budget estimation created successfully", 
        data: {
          ...newEstimation,
          calculated: {
            total_expenses: totalExpenses,
            total_span_days: totalSpanDays,
            overall_daily_budget: overallDailyBudget,
            expense_breakdown: expenseBreakdown,
            budget_status: currentBudget ? (currentBudget >= totalExpenses ? "sufficient" : "insufficient") : "not_set"
          }
        }
      });
    } catch (error) {
      console.error("Error creating budget estimation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Get all budget estimations for logged-in user
  static async getAllEstimations(req, res) {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const estimations = await BudgetEstimationModel.findAllByUser(userId);
      
      // Add calculated data to each estimation with safe parsing
      const estimationsWithCalc = estimations.map(estimation => {
        // Safe parsing with fallbacks
        let expenses = [];
        let span = [];
        
        try {
          expenses = Array.isArray(estimation.expenses) 
            ? estimation.expenses 
            : (estimation.expenses ? JSON.parse(estimation.expenses) : []);
        } catch (e) {
          console.error('Error parsing expenses:', e);
          expenses = [];
        }
        
        try {
          span = Array.isArray(estimation.span) 
            ? estimation.span 
            : (estimation.span ? JSON.parse(estimation.span) : []);
        } catch (e) {
          console.error('Error parsing span:', e);
          span = [];
        }
        
        // Safe calculations with empty array checks
        const totalExpenses = expenses.length > 0 
          ? expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0)
          : 0;
        
        const totalSpanDays = span.length > 0
          ? span.reduce((sum, period) => sum + (parseInt(period.no_of_days) || 0), 0)
          : 0;
        
        const overallDailyBudget = totalSpanDays > 0 ? totalExpenses / totalSpanDays : 0;
        const currentBudget = parseFloat(estimation.current_budget) || 0;
        
        const expenseBreakdown = expenses.map(expense => ({
          name: expense.name || 'Unknown',
          amount: expense.amount || 0,
          days_span: expense.days_span || 1,
          daily_cost: (expense.days_span || 1) > 0 ? (expense.amount || 0) / (expense.days_span || 1) : 0
        }));
        
        return {
          ...estimation,
          expenses,
          span,
          calculated: {
            total_expenses: totalExpenses,
            total_span_days: totalSpanDays,
            overall_daily_budget: overallDailyBudget,
            expense_breakdown: expenseBreakdown,
            budget_status: currentBudget ? (currentBudget >= totalExpenses ? "sufficient" : "insufficient") : "not_set",
            budget_gap: currentBudget ? currentBudget - totalExpenses : null
          }
        };
      });
      
      res.status(200).json({ 
        success: true, 
        count: estimations.length, 
        data: estimationsWithCalc 
      });
    } catch (error) {
      console.error("Error fetching budget estimations:", error);
      res.status(500).json({ error: "Internal server error: " + error.message });
    }
  }

  // Get budget estimation by ID (with user ownership check)
  static async getEstimationById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const estimation = await BudgetEstimationModel.findById(id, userId);

      if (!estimation) {
        return res.status(404).json({ error: "Budget estimation not found" });
      }

      const expenses = Array.isArray(estimation.expenses) ? estimation.expenses : JSON.parse(estimation.expenses);
      const span = Array.isArray(estimation.span) ? estimation.span : JSON.parse(estimation.span);
      
      const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      const totalSpanDays = span.reduce((sum, period) => sum + (parseInt(period.no_of_days) || 0), 0);
      const overallDailyBudget = totalSpanDays > 0 ? totalExpenses / totalSpanDays : 0;
      const currentBudget = parseFloat(estimation.current_budget) || 0;
      
      const expenseBreakdown = expenses.map(expense => ({
        name: expense.name,
        amount: expense.amount,
        days_span: expense.days_span,
        daily_cost: expense.days_span > 0 ? expense.amount / expense.days_span : 0,
        total_cost_for_span: (expense.amount / expense.days_span) * totalSpanDays
      }));

      res.status(200).json({ 
        success: true, 
        data: {
          ...estimation,
          expenses,
          span,
          calculated: {
            total_expenses: totalExpenses,
            total_span_days: totalSpanDays,
            overall_daily_budget: overallDailyBudget,
            expense_breakdown: expenseBreakdown,
            budget_status: currentBudget ? (currentBudget >= totalExpenses ? "sufficient" : "insufficient") : "not_set",
            budget_gap: currentBudget ? currentBudget - totalExpenses : null,
            budget_sufficiency_percentage: currentBudget ? ((currentBudget / totalExpenses) * 100).toFixed(2) : null
          }
        }
      });
    } catch (error) {
      console.error("Error fetching budget estimation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Update budget estimation (with user ownership check)
  static async updateEstimation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const { name, description, expenses, span, currentBudget } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if estimation exists and belongs to user
      const existingEstimation = await BudgetEstimationModel.findById(id, userId);
      if (!existingEstimation) {
        return res.status(404).json({ error: "Budget estimation not found" });
      }

      // Validation for provided fields
      if (name !== undefined && !name.trim()) {
        return res.status(400).json({ error: "Name cannot be empty" });
      }

      if (expenses !== undefined) {
        if (!Array.isArray(expenses) || expenses.length === 0) {
          return res.status(400).json({ error: "Expenses must be a non-empty array" });
        }
        for (const expense of expenses) {
          if (!expense.name || !expense.amount || !expense.days_span) {
            return res.status(400).json({ error: "Each expense must have a name, amount, and days_span" });
          }
          if (isNaN(expense.amount) || expense.amount <= 0) {
            return res.status(400).json({ error: `Expense amount for "${expense.name}" must be a positive number` });
          }
          if (isNaN(expense.days_span) || expense.days_span <= 0) {
            return res.status(400).json({ error: `Days span for "${expense.name}" must be a positive number` });
          }
        }
      }

      if (span !== undefined) {
        if (!Array.isArray(span) || span.length === 0) {
          return res.status(400).json({ error: "Span must be a non-empty array" });
        }
        for (const period of span) {
          if (!period.name || !period.no_of_days) {
            return res.status(400).json({ error: "Each span period must have a name and number of days" });
          }
          if (isNaN(period.no_of_days) || period.no_of_days <= 0) {
            return res.status(400).json({ error: `Number of days for "${period.name}" must be a positive number` });
          }
        }
      }

      if (currentBudget !== undefined && currentBudget !== null && (isNaN(currentBudget) || currentBudget < 0)) {
        return res.status(400).json({ error: "Current budget must be a positive number" });
      }

      const estimationData = {
        name: name !== undefined ? name.trim() : existingEstimation.name,
        description: description !== undefined ? description : existingEstimation.description,
        expenses: expenses || existingEstimation.expenses,
        span: span || existingEstimation.span,
        currentBudget: currentBudget !== undefined ? currentBudget : existingEstimation.current_budget
      };

      const updatedEstimation = await BudgetEstimationModel.update(id, estimationData, userId);
      
      if (!updatedEstimation) {
        return res.status(500).json({ error: "Failed to update budget estimation" });
      }
      
      const expensesData = Array.isArray(updatedEstimation.expenses) ? updatedEstimation.expenses : JSON.parse(updatedEstimation.expenses);
      const spanData = Array.isArray(updatedEstimation.span) ? updatedEstimation.span : JSON.parse(updatedEstimation.span);
      const totalExpenses = expensesData.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      const totalSpanDays = spanData.reduce((sum, period) => sum + (parseInt(period.no_of_days) || 0), 0);
      const overallDailyBudget = totalSpanDays > 0 ? totalExpenses / totalSpanDays : 0;
      const currentBudgetValue = parseFloat(updatedEstimation.current_budget) || 0;
      
      const expenseBreakdown = expensesData.map(expense => ({
        name: expense.name,
        amount: expense.amount,
        days_span: expense.days_span,
        daily_cost: expense.days_span > 0 ? expense.amount / expense.days_span : 0
      }));

      res.status(200).json({ 
        success: true, 
        message: "Budget estimation updated successfully", 
        data: {
          ...updatedEstimation,
          calculated: {
            total_expenses: totalExpenses,
            total_span_days: totalSpanDays,
            overall_daily_budget: overallDailyBudget,
            expense_breakdown: expenseBreakdown,
            budget_status: currentBudgetValue ? (currentBudgetValue >= totalExpenses ? "sufficient" : "insufficient") : "not_set"
          }
        }
      });
    } catch (error) {
      console.error("Error updating budget estimation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // Delete budget estimation (with user ownership check)
  static async deleteEstimation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      // Check if estimation exists and belongs to user
      const existingEstimation = await BudgetEstimationModel.findById(id, userId);
      if (!existingEstimation) {
        return res.status(404).json({ error: "Budget estimation not found" });
      }

      await BudgetEstimationModel.delete(id, userId);
      res.status(200).json({ 
        success: true, 
        message: "Budget estimation deleted successfully",
        data: existingEstimation 
      });
    } catch (error) {
      console.error("Error deleting budget estimation:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default BudgetEstimatorController;