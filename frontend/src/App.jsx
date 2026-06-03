import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UseTheme } from "./hooks/UseTheme";
import Navbar from "./components/Navbar";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import Homepage from "./pages/Homepage";
import Dashboard from "./pages/Dashboard";
import BudgetEstimator from "./pages/BudgetEstimator";
import CreateTransaction from "./pages/CreateTransaction";
import TransactionsList from "./pages/TransactionsList";
import ViewTransaction from "./pages/ViewTransaction";
import EditTransaction from "./pages/EditTransaction";
import BudgetEstimatesList from "./pages/BudgetEstimatesList";
import ViewEstimation from "./pages/ViewEstimation";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import EditBudgetEstimate from "./pages/EditBudgetEstimate";
import Profile from "./pages/Profile";

import './App.css'

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/budget-estimator" element={<BudgetEstimator />} />
        <Route path="/budget-estimates" element={<BudgetEstimatesList />} />
        <Route path="/budget-estimates/:id" element={<ViewEstimation />} />
        <Route path="/budget-estimates/:id/edit" element={<EditBudgetEstimate />} />

        {/* Transaction Routes */}
        <Route path="/transactions" element={<TransactionsList />} />
        <Route path="/transactions/new" element={<CreateTransaction />} />
        <Route path="/transactions/:id" element={<ViewTransaction />} />
        <Route path="/transactions/:id/edit" element={<EditTransaction />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email/" element={<VerifyEmail />} />

        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  )
}

function App() {
  // Initialize theme hook (theme is applied automatically)
  UseTheme();

  return (
    <div className="min-h-screen bg-background text-text">
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;