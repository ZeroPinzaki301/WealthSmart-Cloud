import express from "express";
import BudgetEstimatorController from "../controllers/budgetEstimator.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All budget estimator routes require authentication
router.use(protect);

router.post("/budget-estimations", BudgetEstimatorController.createEstimation);
router.get("/budget-estimations", BudgetEstimatorController.getAllEstimations);
router.get("/budget-estimations/:id", BudgetEstimatorController.getEstimationById);
router.put("/budget-estimations/:id", BudgetEstimatorController.updateEstimation);
router.delete("/budget-estimations/:id", BudgetEstimatorController.deleteEstimation);

export default router;