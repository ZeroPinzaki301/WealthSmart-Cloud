import express from "express";
import BudgetController from "../controllers/budget.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All budget routes require authentication
router.use(protect);

// User-specific routes (what the frontend will use)
router.post("/budgets", BudgetController.createBudget);
router.get("/budgets/my", BudgetController.getUserBudgets);
router.get("/budgets/my/summary", BudgetController.getUserSummary);
router.get("/budgets/my/summary/:year/:month", BudgetController.getUserMonthlySummary);
router.get("/budgets/my/date-range", BudgetController.getUserBudgetsByDateRange);
router.get("/budgets/my/type/:type", BudgetController.getUserBudgetsByType);
router.get("/budgets/my/:id", BudgetController.getBudgetById);
router.put("/budgets/:id", BudgetController.updateBudget);
router.delete("/budgets/:id", BudgetController.deleteBudget);

// Admin routes (keep for future admin panel - protect with admin middleware later)
// router.get("/admin/budgets", BudgetController.getAllBudgets);
// router.get("/admin/budgets/date-range", BudgetController.getAllBudgetsByDateRange);
// router.get("/admin/budgets/summary", BudgetController.getAllSummary);

export default router;