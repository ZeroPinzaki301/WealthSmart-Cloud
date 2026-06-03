import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { TbArrowLeft, TbEdit, TbTrash, TbCalendar, TbCurrencyDollar, TbChartBar } from "react-icons/tb";
import { UseCurrency } from "../hooks/UseCurrency";
import WealthSmartBG from "../assets/WealthSmartBG.png";

export default function ViewEstimation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { formatCurrency, currency } = UseCurrency();

  useEffect(() => {
    fetchEstimation();
  }, [id]);

  const fetchEstimation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get(`/budget-estimations/${id}`);
      
      let estimationData = null;
      if (response.data && response.data.data) {
        estimationData = response.data.data;
      } else if (response.data) {
        estimationData = response.data;
      }
      
      setEstimation(estimationData);
    } catch (err) {
      console.error("Error fetching budget estimation:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to load budget estimation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/budget-estimations/${id}`);
      navigate("/budget-estimates");
    } catch (err) {
      console.error("Error deleting budget estimation:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to delete budget estimation");
      }
    }
  };

  const calculateBreakdown = () => {
    if (!estimation) return null;
    
    const expenses = estimation.expenses || [];
    const span = estimation.span || [];
    
    const totalExpenses = expenses.reduce((sum, exp) => {
      const spanDays = parseInt(exp.days_span) || 0;
      const extractedAmount = parseFloat(exp.amount) || 0;
      const amount = spanDays > 1 ? (extractedAmount / spanDays) * 1 : extractedAmount;
      return sum + amount;
    }, 0);
    
    const maxDays = Math.max(...span.map(p => parseInt(p.no_of_days) || 0), 0);
    const currentBudget = parseFloat(estimation.current_budget) || 0;
    
    const periodBreakdown = span.map(period => {
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
      maxDays,
      currentBudget,
      periodBreakdown,
      overallTotalExpensesMaxSpan: totalExpenses * maxDays,
      overallSurplus: currentBudget - (totalExpenses * maxDays),
      isOverallSufficient: currentBudget >= (totalExpenses * maxDays)
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TbTrash className="text-3xl text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Confirm Delete</h3>
          <p className="text-text-muted mb-6 text-sm">
            Are you sure you want to delete "{estimation?.name}"? This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 bg-background-subtle text-text border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-darkest transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading budget estimation...</div>
      </div>
    );
  }

  if (error || !estimation) {
    return (
      <div className="min-h-screen pt-0">
        <div className="relative z-10 max-w-[95%] mx-auto bg-secondary-darkest/90 border rounded-lg p-6">
          <div className="bg-secondary/10 border border-secondary text-secondary rounded-lg p-4 mb-4 text-sm">
            {error || "Budget estimation not found"}
          </div>
          <button
            onClick={() => navigate("/budget-estimates")}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer text-sm"
          >
            Back to Estimations
          </button>
        </div>
      </div>
    );
  }

  const breakdown = calculateBreakdown();

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
      <div className="relative backdrop-blur-[3px] z-10 max-w-[95%] mx-auto bg-secondary-darkest/90 border rounded-lg p-3 sm:p-6 mb-20 sm:mb-6 md:top-4 -top-[4.5em]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={() => navigate("/budget-estimates")}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-background-subtle transition-colors cursor-pointer mt-1 sm:mt-0"
            >
              <TbArrowLeft className="text-xl sm:text-2xl text-primary" />
            </button>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary break-words">{estimation.name}</h1>
              {estimation.description && (
                <p className="text-text-muted text-xs sm:text-sm mt-1 break-words">{estimation.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/budget-estimates/${id}/edit`)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer text-sm"
            >
              <TbEdit className="text-base sm:text-lg" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/20 transition-colors cursor-pointer text-sm"
            >
              <TbTrash className="text-base sm:text-lg" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Metadata Cards - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-background rounded-lg border border-border p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1 sm:mb-2">
              <TbCurrencyDollar className="text-base sm:text-lg" />
              <span className="text-xs sm:text-sm">Total Budget</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-primary break-words">{formatCurrency(breakdown.currentBudget)}</p>
          </div>
          
          <div className="bg-background rounded-lg border border-border p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1 sm:mb-2">
              <TbChartBar className="text-base sm:text-lg" />
              <span className="text-xs sm:text-sm">Total Expenses</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-secondary break-words">{formatCurrency(breakdown.overallTotalExpensesMaxSpan)}</p>
          </div>
          
          <div className="bg-background rounded-lg border border-border p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1 sm:mb-2">
              <TbCalendar className="text-base sm:text-lg" />
              <span className="text-xs sm:text-sm">Maximum Span</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-primary">{breakdown.maxDays} days</p>
          </div>
          
          <div className="bg-background rounded-lg border border-border p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-text-muted mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm">Overall Status</span>
            </div>
            <p className={`text-lg sm:text-2xl font-bold ${breakdown.isOverallSufficient ? 'text-secondary-lightest' : 'text-secondary'}`}>
              {breakdown.isOverallSufficient ? 'Sufficient' : 'Insufficient'}
            </p>
          </div>
        </div>

        {/* Period-wise Breakdown Table - Scrollable */}
        <div className="bg-background-subtle rounded-lg border border-border overflow-hidden mb-6 sm:mb-8">
          <div className="p-3 sm:p-6 border-b border-border">
            <h2 className="text-base sm:text-xl font-semibold text-primary">Period-wise Budget Breakdown</h2>
          </div>
          
          <div className="overflow-x-auto overflow-y-visible max-h-[400px] sm:max-h-none">
            <div className="min-w-[800px] sm:min-w-0">
              <table className="w-full">
                <thead className="bg-background sticky top-0 z-10">
                  <tr className="border-b border-border">
                    <th className="text-left p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Period</th>
                    <th className="text-right p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Days</th>
                    <th className="text-right p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Ratio</th>
                    <th className="text-right p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Prorated Budget</th>
                    <th className="text-right p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Prorated Expenses</th>
                    <th className="text-right p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Daily Budget</th>
                    <th className="text-right p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Daily Expense</th>
                    <th className="text-right p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Surplus/Deficit</th>
                    <th className="text-center p-2 sm:p-4 text-text-muted font-medium text-xs sm:text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.periodBreakdown.map((period, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-background/50 transition-colors">
                      <td className="p-2 sm:p-4 text-text font-medium text-xs sm:text-sm break-words">{period.name}</td>
                      <td className="p-2 sm:p-4 text-right text-text text-xs sm:text-sm">{period.days} days</td>
                      <td className="p-2 sm:p-4 text-right text-text-muted text-xs sm:text-sm">{period.ratio.toFixed(1)}%</td>
                      <td className="p-2 sm:p-4 text-right text-primary font-semibold text-xs sm:text-sm">
                        {formatCurrency(period.proratedBudget)}
                      </td>
                      <td className="p-2 sm:p-4 text-right text-secondary font-semibold text-xs sm:text-sm">
                        {formatCurrency(period.proratedExpenses)}
                      </td>
                      <td className="p-2 sm:p-4 text-right text-text-muted text-xs sm:text-sm">
                        {formatCurrency(period.dailyBudget)}/day
                      </td>
                      <td className="p-2 sm:p-4 text-right text-text-muted text-xs sm:text-sm">
                        {formatCurrency(period.dailyExpense)}/day
                      </td>
                      <td className={`p-2 sm:p-4 text-right font-semibold text-xs sm:text-sm ${period.surplusDeficit >= 0 ? 'text-secondary-lightest' : 'text-secondary'}`}>
                        {formatCurrency(period.surplusDeficit)}
                      </td>
                      <td className="p-2 sm:p-4 text-center">
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
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-background-subtle rounded-lg border border-border overflow-hidden mb-6 sm:mb-8">
          <div className="p-3 sm:p-6 border-b border-border">
            <h2 className="text-base sm:text-xl font-semibold text-primary">Expenses Breakdown</h2>
          </div>
          
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {(estimation.expenses || []).map((expense, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-background rounded-lg border border-border">
                  <span className="text-text font-medium text-sm sm:text-base break-words">{expense.name}</span>
                  <div className="flex justify-between items-center sm:gap-4">
                    <span className="text-primary font-semibold text-sm sm:text-base">{formatCurrency(expense.amount)}</span>
                    <span className="text-secondary text-xs sm:text-sm">per {expense.days_span} day/s</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                <span className="text-text font-semibold text-sm sm:text-base">Total Daily Expenses</span>
                <span className="text-secondary font-bold text-base sm:text-lg">{formatCurrency(breakdown.totalExpenses)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Periods */}
        <div className="bg-background-subtle rounded-lg border border-border overflow-hidden mb-6 sm:mb-8">
          <div className="p-3 sm:p-6 border-b border-border">
            <h2 className="text-base sm:text-xl font-semibold text-primary">Time Periods</h2>
          </div>
          
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {(estimation.span || []).map((period, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                  <span className="text-text font-medium text-sm sm:text-base break-words">{period.name}</span>
                  <span className="text-primary font-semibold text-sm sm:text-base whitespace-nowrap">{period.no_of_days} days</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-background-subtle rounded-lg border border-border overflow-hidden">
          <div className="p-3 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-text-muted">Created:</span>
                <p className="text-text mt-1 break-words">{formatDateTime(estimation.created_at)}</p>
              </div>
              <div>
                <span className="text-text-muted">Last Updated:</span>
                <p className="text-text mt-1 break-words">{formatDateTime(estimation.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmModal />}
    </div>
  );
}