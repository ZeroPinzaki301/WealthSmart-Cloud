import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { TbTrash, TbPlus, TbArrowLeft, TbLogin, TbUserPlus } from "react-icons/tb";
import { UseCurrency } from "../hooks/UseCurrency";
import WealthSmartBG from '../assets/WealthSmartBG.png';
import { TbFileAnalyticsFilled } from "react-icons/tb";
import { useAuth } from "../context/AuthContext";

export default function BudgetEstimator() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const { formatCurrency, currency } = UseCurrency();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    currentBudget: "",
    expenses: [
      { name: "", amount: "", days_span: "1" }
    ],
    span: [
      { name: "", no_of_days: "" }
    ]
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [user, authLoading, navigate]);

  // Fetch estimation data if in edit mode and authenticated
  useEffect(() => {
    if (user && isEditMode) {
      fetchEstimation();
    }
  }, [id, user]);

  const fetchEstimation = async () => {
    try {
      setFetching(true);
      const response = await axiosInstance.get(`/budget-estimations/${id}`);
      let data = response.data?.data || response.data;
      
      if (data) {
        setFormData({
          name: data.name || "",
          description: data.description || "",
          currentBudget: data.current_budget || "",
          expenses: data.expenses?.length ? data.expenses : [{ name: "", amount: "", days_span: "1" }],
          span: data.span?.length ? data.span : [{ name: "", no_of_days: "" }]
        });
      }
    } catch (err) {
      console.error("Error fetching estimation:", err);
      if (err.response?.status === 401) {
        setShowAuthModal(true);
      } else {
        setError(err.response?.data?.error || "Failed to load estimation");
      }
    } finally {
      setFetching(false);
    }
  };

  // If not authenticated, show nothing while checking
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  // Auth Modal Component
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-darkest border border-border rounded-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <TbLogin className="text-3xl text-primary" />
        </div>
        <h2 className="text-xl font-bold text-primary mb-2">Authentication Required</h2>
        <p className="text-text-muted mb-6 text-sm">
          You need to be logged in to access the Budget Estimator.
        </p>
        <p className="text-sm text-text-muted mb-6">
          Redirecting to login page in <span className="text-primary font-bold">{redirectCountdown}</span> seconds...
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <TbLogin className="text-lg" />
            Login Now
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex-1 bg-background-subtle text-text border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <TbUserPlus className="text-lg" />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );

  if (showAuthModal) {
    return <AuthModal />;
  }

  // Handle basic input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle expenses array changes
  const handleExpenseChange = (index, field, value) => {
    const updatedExpenses = [...formData.expenses];
    updatedExpenses[index][field] = value;
    setFormData(prev => ({
      ...prev,
      expenses: updatedExpenses
    }));
  };

  // Handle span array changes
  const handleSpanChange = (index, field, value) => {
    const updatedSpan = [...formData.span];
    updatedSpan[index][field] = value;
    setFormData(prev => ({
      ...prev,
      span: updatedSpan
    }));
  };

  // Add new expense field
  const addExpense = () => {
    setFormData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { name: "", amount: "", days_span: "1" }]
    }));
  };

  // Remove expense field
  const removeExpense = (index) => {
    if (formData.expenses.length === 1) {
      setError("At least one expense is required");
      return;
    }
    const updatedExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      expenses: updatedExpenses
    }));
  };

  // Add new span field
  const addSpan = () => {
    setFormData(prev => ({
      ...prev,
      span: [...prev.span, { name: "", no_of_days: "" }]
    }));
  };

  // Remove span field
  const removeSpan = (index) => {
    if (formData.span.length === 1) {
      setError("At least one time period is required");
      return;
    }
    const updatedSpan = formData.span.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      span: updatedSpan
    }));
  };

  // Calculate period-wise breakdown
  const calculatePeriodBreakdown = () => {
    const totalExpenses = formData.expenses.reduce((sum, exp) => {
      const spanDays = parseInt(exp.days_span) || 0;
      const extractedAmount = parseFloat(exp.amount) || 0;
      const amount = spanDays > 1 ? (extractedAmount / spanDays) * 1 : extractedAmount;
      return sum + amount;
    }, 0);
    
    const totalDays = formData.span.reduce((sum, period) => {
      const days = parseInt(period.no_of_days) || 0;
      return sum + days;
    }, 0);
    
    const maxDays = Math.max(...formData.span.map(p => parseInt(p.no_of_days) || 0), 0);
    const currentBudget = parseFloat(formData.currentBudget) || 0;
    
    const dailyBudgetRate = maxDays > 0 ? currentBudget / maxDays : 0;
    
    const periodBreakdown = formData.span.map(period => {
      const days = parseInt(period.no_of_days) || 0;
      const ratio = maxDays > 0 ? days / maxDays : 0;
      const proratedBudget = currentBudget * ratio;
      const proratedExpenses = totalExpenses * days;
      const dailyBudget = days > 0 ? proratedBudget / days : 0;
      const dailyExpense = days > 0 ? proratedExpenses / days : 0;
      const surplusDeficit = proratedBudget - proratedExpenses;
      
      return {
        name: period.name,
        days,
        ratio: ratio * 100,
        proratedBudget,
        proratedExpenses,
        dailyBudget,
        dailyExpense,
        surplusDeficit,
        isSufficient: proratedBudget >= proratedExpenses
      };
    });
    
    return {
      totalExpenses,
      totalDays,
      maxDays,
      currentBudget,
      dailyBudgetRate,
      periodBreakdown,
      overallTotalBudget: currentBudget,
      overallTotalExpenses: totalExpenses,
      overallSurplus: currentBudget - (totalExpenses * maxDays),
      isOverallSufficient: currentBudget >= totalExpenses
    };
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter a name for this budget estimation");
      return false;
    }
    
    for (let i = 0; i < formData.expenses.length; i++) {
      const expense = formData.expenses[i];
      if (!expense.name.trim()) {
        setError(`Please enter a name for expense #${i + 1}`);
        return false;
      }
      if (!expense.amount || parseFloat(expense.amount) <= 0) {
        setError(`Please enter a valid amount for ${expense.name}`);
        return false;
      }
      if (!expense.days_span || parseInt(expense.days_span) <= 0) {
        setError(`Please enter a valid days span for ${expense.name}`);
        return false;
      }
    }
    
    for (let i = 0; i < formData.span.length; i++) {
      const period = formData.span[i];
      if (!period.name.trim()) {
        setError(`Please enter a name for time period #${i + 1}`);
        return false;
      }
      if (!period.no_of_days || parseInt(period.no_of_days) <= 0) {
        setError(`Please enter valid number of days for ${period.name}`);
        return false;
      }
    }
    
    if (formData.currentBudget && parseFloat(formData.currentBudget) < 0) {
      setError("Current budget cannot be negative");
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const expensesData = formData.expenses.map(exp => ({
        name: exp.name.trim(),
        amount: parseFloat(exp.amount),
        days_span: parseInt(exp.days_span)
      }));
      
      const spanData = formData.span.map(period => ({
        name: period.name.trim(),
        no_of_days: parseInt(period.no_of_days)
      }));
      
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        expenses: expensesData,
        span: spanData,
        currentBudget: formData.currentBudget ? parseFloat(formData.currentBudget) : null
      };
      
      let response;
      if (isEditMode) {
        response = await axiosInstance.put(`/budget-estimations/${id}`, payload);
      } else {
        response = await axiosInstance.post("/budget-estimations", payload);
      }
      
      if (response.data.success) {
        navigate("/budget-estimates");
      } else {
        setError(response.data.error || `Failed to ${isEditMode ? 'update' : 'create'} budget estimation`);
      }
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} budget estimation:`, err);
      if (err.response?.status === 401) {
        setShowAuthModal(true);
      } else {
        setError(err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} budget estimation`);
      }
    } finally {
      setLoading(false);
    }
  };

  const breakdown = calculatePeriodBreakdown();

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading estimation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-0">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-secondary z-0"
        style={{
          maskImage: `url(${WealthSmartBG})`,
          maskSize: 'cover',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          height: '100vh',
        }}
      />
      
      {/* Main Container */}
      <div className="relative backdrop-blur-[3px] z-10 mx-auto bg-secondary-darkest/90 border rounded-lg p-3 sm:p-6 mb-20 md:top-4 -top-[4.75em] md:max-w-[95%] sm:w-full md:mx-auto sm:mx-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">
            {isEditMode ? "Edit Budget Estimation" : "Create Budget Estimation"}
          </h1>
          <button
            onClick={() => navigate("/budget-estimates")}
            className="w-full sm:w-auto bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            <TbFileAnalyticsFilled className="text-base sm:text-xl" />
            <span className="hidden sm:inline">List of Estimates</span>
            <span className="sm:hidden">Estimates</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <div className="bg-background rounded-lg border border-border p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold text-primary mb-3 sm:mb-4">Basic Information</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-text font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Estimation Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm sm:text-base"
                  placeholder="e.g., Monthly Grocery Budget, Project X Estimation"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-text font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm sm:text-base"
                  rows="3"
                  placeholder="Add any additional details about this budget estimation..."
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-text font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Current Budget (Optional)
                </label>
                <input
                  type="number"
                  name="currentBudget"
                  value={formData.currentBudget}
                  onChange={handleInputChange}
                  className="w-full px-3 sm:px-4 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm sm:text-base"
                  placeholder="Enter current budget if applicable"
                  step="0.01"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="bg-background rounded-lg border border-border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-base sm:text-xl font-semibold text-primary">Expenses *</h2>
              <button
                type="button"
                onClick={addExpense}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer text-sm w-full sm:w-auto"
                disabled={loading}
              >
                <TbPlus className="text-base sm:text-lg" />
                Add Expense
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.expenses.map((expense, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-background-subtle rounded-lg border border-border">
                  <div className="flex-1 w-full">
                    <label className="block text-text-muted text-xs mb-1 sm:hidden">Name or Description</label>
                    <input
                      type="text"
                      value={expense.name}
                      onChange={(e) => handleExpenseChange(index, "name", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                      placeholder="Expense name"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-text-muted text-xs mb-1 sm:hidden">Amount</label>
                    <input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => handleExpenseChange(index, "amount", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                      placeholder="Amount"
                      step="0.01"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-text-muted text-xs mb-1 sm:hidden">Expense Frequency in Days</label>
                    <input
                      type="number"
                      value={expense.days_span}
                      onChange={(e) => handleExpenseChange(index, "days_span", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                      placeholder="Days span"
                      step="1"
                      min="1"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExpense(index)}
                    className="w-full sm:w-auto px-3 py-2 text-secondary hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    disabled={loading}
                  >
                    <TbTrash className="text-base" />
                    <span className="sm:hidden text-xs">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Time Span Section */}
          <div className="bg-background rounded-lg border border-border p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-base sm:text-xl font-semibold text-primary">Time Periods *</h2>
              <button
                type="button"
                onClick={addSpan}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer text-sm w-full sm:w-auto"
                disabled={loading}
              >
                <TbPlus className="text-base sm:text-lg" />
                Add Period
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.span.map((period, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-start p-3 bg-background-subtle rounded-lg border border-border">
                  <div className="flex-1 w-full">
                    <label className="block text-text-muted text-xs mb-1 sm:hidden">Name or Description</label>
                    <input
                      type="text"
                      value={period.name}
                      onChange={(e) => handleSpanChange(index, "name", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                      placeholder="Period name (e.g., Week 1, Month 1)"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-text-muted text-xs mb-1 sm:hidden">Number of Days</label>
                    <input
                      type="number"
                      value={period.no_of_days}
                      onChange={(e) => handleSpanChange(index, "no_of_days", e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                      placeholder="Number of days"
                      step="1"
                      disabled={loading}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpan(index)}
                    className="w-full sm:w-auto px-3 py-2 text-secondary hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                    disabled={loading}
                  >
                    <TbTrash className="text-base" />
                    <span className="sm:hidden text-xs">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Preview Section */}
          {breakdown.periodBreakdown.length > 0 && (
            <div className="bg-background-subtle rounded-lg border border-border p-4 sm:p-6">
              <h2 className="text-base sm:text-xl font-semibold text-primary mb-4">Period-wise Budget Breakdown</h2>
              
              {/* Overall Summary - Responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 pb-6 border-b border-border">
                <div className="bg-background rounded-lg p-3">
                  <p className="text-text-muted text-xs sm:text-sm">Daily Expenses</p>
                  <p className="text-lg sm:text-2xl font-bold text-secondary">
                    {formatCurrency(breakdown.overallTotalExpenses)}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-text-muted text-xs sm:text-sm">Total Expenses via Maximum Span</p>
                  <p className="text-lg sm:text-2xl font-bold text-secondary">
                    {formatCurrency(breakdown.overallTotalExpenses * breakdown.maxDays)}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-text-muted text-xs sm:text-sm">Maximum Span</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary">
                    {breakdown.maxDays} days
                  </p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-text-muted text-xs sm:text-sm">Budget Before Expenses</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary">
                    {formatCurrency(breakdown.currentBudget)}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-text-muted text-xs sm:text-sm">Budget After Expenses</p>
                  <p className="text-lg sm:text-2xl font-bold text-primary">
                    {formatCurrency(breakdown.currentBudget - (breakdown.overallTotalExpenses * breakdown.maxDays))}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <p className="text-text-muted text-xs sm:text-sm">Overall Status</p>
                  <p className={`text-lg sm:text-2xl font-bold ${breakdown.isOverallSufficient ? 'text-secondary-lightest' : 'text-secondary'}`}>
                    {breakdown.isOverallSufficient ? 'Sufficient' : 'Insufficient'}
                  </p>
                </div>
              </div>

              {/* Period-wise Breakdown Table - Horizontal scroll on mobile with increased height */}
              <div className="overflow-x-auto overflow-y-visible max-h-[400px] sm:max-h-none">
                <div className="min-w-[800px] sm:min-w-0">
                  <table className="w-full">
                    <thead className="bg-background sticky top-0 z-10">
                      <tr className="border-b border-border">
                        <th className="text-left p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Period</th>
                        <th className="text-right p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Days</th>
                        <th className="text-right p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Ratio</th>
                        <th className="text-right p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Prorated Budget</th>
                        <th className="text-right p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Prorated Expenses</th>
                        <th className="text-right p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Daily Budget</th>
                        <th className="text-right p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Daily Expense</th>
                        <th className="text-right p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Surplus/Deficit</th>
                        <th className="text-center p-2 sm:p-3 text-text-muted font-medium text-xs sm:text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdown.periodBreakdown.map((period, idx) => (
                        <tr key={idx} className="border-b border-border hover:bg-background/50 transition-colors">
                          <td className="p-2 sm:p-3 text-text font-medium text-xs sm:text-sm">{period.name}</td>
                          <td className="p-2 sm:p-3 text-right text-text text-xs sm:text-sm">{period.days} days</td>
                          <td className="p-2 sm:p-3 text-right text-text-muted text-xs sm:text-sm">{period.ratio.toFixed(1)}%</td>
                          <td className="p-2 sm:p-3 text-right text-primary font-semibold text-xs sm:text-sm">
                            {formatCurrency(period.proratedBudget)}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-secondary font-semibold text-xs sm:text-sm">
                            {formatCurrency(period.proratedExpenses)}
                          </td>
                          <td className="p-2 sm:p-3 text-right text-text-muted text-xs sm:text-sm">
                            {formatCurrency(period.dailyBudget)}/day
                          </td>
                          <td className="p-2 sm:p-3 text-right text-text-muted text-xs sm:text-sm">
                            {formatCurrency(period.dailyExpense)}/day
                          </td>
                          <td className={`p-2 sm:p-3 text-right font-semibold text-xs sm:text-sm ${period.surplusDeficit >= 0 ? 'text-secondary-lightest' : 'text-secondary'}`}>
                            {formatCurrency(period.surplusDeficit)}
                          </td>
                          <td className="p-2 sm:p-3 text-center">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                              period.isSufficient 
                                ? 'bg-green-500/10 text-secondary-lightest' 
                                : 'bg-red-500/10 text-secondary'
                            }`}>
                              {period.isSufficient ? 'Sufficient' : 'Insufficient'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculation Notes */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-background rounded-lg text-xs sm:text-sm text-text-muted">
                <p className="font-semibold mb-2">Calculation Methodology:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Highest time period ({breakdown.maxDays} days) is used as the base for budget distribution</li>
                  <li>Each period's budget is prorated based on its days relative to the highest period</li>
                  <li>Expenses are distributed proportionally across periods based on days ratio</li>
                  <li>Daily rates show the average budget and expense per day for each period</li>
                </ul>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/budget-estimates")}
              className="px-4 sm:px-6 py-2 bg-background-subtle text-text border border-border rounded-lg hover:bg-background transition-colors cursor-pointer text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 sm:px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer disabled:opacity-50 text-sm"
              disabled={loading}
            >
              {loading ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Estimation" : "Create Estimation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}