import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { TbCashPlus, TbLogin, TbUserPlus, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { HiClipboardDocumentList } from "react-icons/hi2";
import { UseCurrency } from "../hooks/UseCurrency";
import WealthSmartBG from '../assets/WealthSmartBG.png';
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [summary, setSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    balance: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [displayStartIndex, setDisplayStartIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const { formatCurrency, currency } = UseCurrency();

  // Handle responsive items per page
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerPage(4); // Mobile: 4 months at a time
      } else {
        setItemsPerPage(12); // Desktop/Tablet: Show all 12 months
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset display start when items per page changes
  useEffect(() => {
    setDisplayStartIndex(0);
  }, [itemsPerPage]);

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

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const toLocalDateString = (utcDateString) => {
    if (!utcDateString) return null;
    const date = new Date(utcDateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (utcDateString) => {
    if (!utcDateString) return 'N/A';
    const date = new Date(utcDateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Singapore'
    });
  };

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (utcDateString) => {
    const localDateStr = toLocalDateString(utcDateString);
    const todayStr = getTodayString();
    return localDateStr === todayStr;
  };

  const isCurrentWeek = (utcDateString) => {
    const localDateStr = toLocalDateString(utcDateString);
    const today = new Date();
    const currentDay = today.getDay();
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    const startYear = startOfWeek.getFullYear();
    const startMonth = String(startOfWeek.getMonth() + 1).padStart(2, '0');
    const startDay = String(startOfWeek.getDate()).padStart(2, '0');
    const startOfWeekStr = `${startYear}-${startMonth}-${startDay}`;
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const endYear = endOfWeek.getFullYear();
    const endMonth = String(endOfWeek.getMonth() + 1).padStart(2, '0');
    const endDay = String(endOfWeek.getDate()).padStart(2, '0');
    const endOfWeekStr = `${endYear}-${endMonth}-${endDay}`;
    
    return localDateStr >= startOfWeekStr && localDateStr <= endOfWeekStr;
  };

  const isCurrentMonth = (utcDateString) => {
    const localDateStr = toLocalDateString(utcDateString);
    const [year, month] = localDateStr.split('-');
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    return parseInt(year) === currentYear && parseInt(month) === currentMonth;
  };

  const isCurrentYear = (utcDateString) => {
    const localDateStr = toLocalDateString(utcDateString);
    const [year] = localDateStr.split('-');
    const today = new Date();
    const currentYear = today.getFullYear();
    
    return parseInt(year) === currentYear;
  };

  const calculatePeriodSummary = (transactions, filterFn) => {
    if (!transactions || transactions.length === 0) {
      return { income: 0, expenses: 0, balance: 0 };
    }
    
    const filtered = transactions.filter(transaction => filterFn(transaction.budget_date));
    
    const income = filtered
      .filter(t => t.is_income === true)
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const expenses = filtered
      .filter(t => t.is_income === false)
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };

  // Calculate last 12 months of data
  const calculateMonthlyData = (transactions) => {
    if (!transactions || transactions.length === 0) return [];
    
    const monthlyMap = new Map();
    const today = new Date();
    
    // Initialize last 12 months (from 11 months ago to current month)
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const yearName = date.getFullYear();
      monthlyMap.set(monthKey, { 
        month: monthName, 
        year: yearName,
        displayLabel: `${monthName} ${yearName}`,
        income: 0, 
        expenses: 0, 
        monthKey, 
        fullDate: date 
      });
    }
    
    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const localDateStr = toLocalDateString(transaction.budget_date);
      if (!localDateStr) return;
      
      const [year, month] = localDateStr.split('-');
      const monthKey = `${year}-${month}`;
      const amount = parseFloat(transaction.amount || 0);
      
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey);
        if (transaction.is_income) {
          data.income += amount;
        } else {
          data.expenses += amount;
        }
        monthlyMap.set(monthKey, data);
      }
    });
    
    // Convert to array (already in chronological order from oldest to newest)
    return Array.from(monthlyMap.values()).sort((a, b) => a.fullDate - b.fullDate);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [summaryRes, transactionsRes] = await Promise.all([
        axiosInstance.get("/budgets/my/summary"),
        axiosInstance.get("/budgets/my")
      ]);
      
      if (summaryRes.data && summaryRes.data.data) {
        setSummary(summaryRes.data.data);
      } else if (summaryRes.data) {
        setSummary(summaryRes.data);
      } else {
        setSummary({ total_income: 0, total_expenses: 0, balance: 0 });
      }
      
      let transactions = [];
      if (transactionsRes.data && transactionsRes.data.data) {
        transactions = transactionsRes.data.data;
      } else if (Array.isArray(transactionsRes.data)) {
        transactions = transactionsRes.data;
      } else if (transactionsRes.data && Array.isArray(transactionsRes.data.transactions)) {
        transactions = transactionsRes.data.transactions;
      }
      
      setAllTransactions(transactions);
      setRecentTransactions(transactions.slice(0, 5));
      setMonthlyData(calculateMonthlyData(transactions));
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        setShowAuthModal(true);
      } else {
        setError(err.response?.data?.error || "Failed to load dashboard data");
      }
      setSummary({ total_income: 0, total_expenses: 0, balance: 0 });
      setRecentTransactions([]);
      setAllTransactions([]);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const todaySummary = calculatePeriodSummary(allTransactions, isToday);
  const weekSummary = calculatePeriodSummary(allTransactions, isCurrentWeek);
  const monthSummary = calculatePeriodSummary(allTransactions, isCurrentMonth);
  const yearSummary = calculatePeriodSummary(allTransactions, isCurrentYear);

  // Navigation handlers
  const totalPages = Math.ceil(monthlyData.length / itemsPerPage);
  const currentPage = Math.floor(displayStartIndex / itemsPerPage) + 1;
  
  const canGoPrevious = displayStartIndex > 0;
  const canGoNext = displayStartIndex + itemsPerPage < monthlyData.length;
  
  const goToPrevious = () => {
    if (canGoPrevious) {
      setDisplayStartIndex(Math.max(0, displayStartIndex - itemsPerPage));
    }
  };
  
  const goToNext = () => {
    if (canGoNext) {
      setDisplayStartIndex(Math.min(monthlyData.length - itemsPerPage, displayStartIndex + itemsPerPage));
    }
  };

  const displayedData = monthlyData.slice(displayStartIndex, displayStartIndex + itemsPerPage);

  const PeriodCard = ({ title, data }) => {
    return (
      <div className="bg-background rounded-lg p-3 border border-border shadow-sm">
        <h3 className="text-text-muted font-semibold mb-2 text-xs">{title}</h3>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">Income</span>
            <span className="text-xs font-semibold text-primary">+{formatCurrency(data.income)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-muted">Expenses</span>
            <span className="text-xs font-semibold text-secondary">-{formatCurrency(data.expenses)}</span>
          </div>
          <div className="border-t border-border pt-1.5 mt-0.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-text-muted">Balance</span>
              <span className={`text-xs font-bold ${data.balance >= 0 ? 'text-secondary-lightest' : 'text-secondary'}`}>
                {formatCurrency(data.balance)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mirrored Bar Chart Component
  const MirroredBarChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-text-muted text-sm">
          No transaction data available for the last 12 months
        </div>
      );
    }

    // Find max value for scaling
    const maxValue = Math.max(
      ...data.flatMap(d => [d.income, d.expenses]),
      1
    );
    
    const chartHeight = 100; // Fixed height for mobile
    
    const getBarHeight = (value) => {
      if (maxValue === 0) return 0;
      const percentage = Math.min(value / maxValue, 1);
      return percentage * chartHeight;
    };

    return (
      <div className="w-full">
        <div 
          className="relative w-full"
          style={{ height: `${chartHeight * 2 + 2}px` }}
        >
          {/* Top Bars - Income */}
          <div className="absolute top-0 left-0 right-0 flex justify-around items-end" style={{ height: `${chartHeight}px` }}>
            {data.map((item, index) => {
              const barHeight = getBarHeight(item.income);
              return (
                <div key={`income-${index}`} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full max-w-[24px] mx-auto">
                    <div 
                      className="bg-gradient-to-t from-primary to-primary-lightest rounded-t-sm transition-all duration-300 mx-auto"
                      style={{ width: '100%', height: `${Math.max(barHeight, 2)}px` }}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-background text-text rounded-md px-1.5 py-0.5 whitespace-nowrap shadow-lg border border-border text-[10px] font-semibold">
                        +{formatCurrency(item.income)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Line */}
          <div 
            className="absolute left-0 right-0 bg-border"
            style={{ top: `${chartHeight}px`, height: `2px` }}
          />

          {/* Bottom Bars - Expenses */}
          <div 
            className="absolute left-0 right-0 flex justify-around items-start"
            style={{ top: `${chartHeight + 2}px`, height: `${chartHeight}px` }}
          >
            {data.map((item, index) => {
              const barHeight = getBarHeight(item.expenses);
              return (
                <div key={`expense-${index}`} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full max-w-[24px] mx-auto">
                    <div 
                      className="bg-gradient-to-b from-secondary to-secondary-darkest rounded-b-sm transition-all duration-300 mx-auto"
                      style={{ width: '100%', height: `${Math.max(barHeight, 2)}px` }}
                    />
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-background text-text rounded-md px-1.5 py-0.5 whitespace-nowrap shadow-lg border border-border text-[10px] font-semibold">
                        -{formatCurrency(item.expenses)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-around mt-2">
          {data.map((item, index) => (
            <div key={`label-${index}`} className="flex-1 text-center">
              <span className="text-[8px] text-text-muted whitespace-nowrap">
                {item.displayLabel}
              </span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-3 mt-2 pt-1.5 border-t border-border">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-primary rounded-sm"></div>
            <span className="text-[9px] text-text-muted">Income</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-secondary rounded-sm"></div>
            <span className="text-[9px] text-text-muted">Expenses</span>
          </div>
        </div>
      </div>
    );
  };

  // Auth Modal Component
  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-darkest border border-border rounded-xl max-w-md w-full p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <TbLogin className="text-3xl text-primary" />
        </div>
        <h2 className="text-xl font-bold text-primary mb-2">Authentication Required</h2>
        <p className="text-text-muted mb-6 text-sm">
          You need to be logged in to access your Dashboard.
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

  if (showAuthModal) return <AuthModal />;

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-text-muted">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Check if we need to show pagination (only on mobile when itemsPerPage < total months)
  const showPagination = itemsPerPage < monthlyData.length;

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
      
      {/* Dashboard Container - Removed top margin */}
      <div className="relative backdrop-blur-[3px] z-10  bg-secondary-darkest/90 border rounded-lg p-3 mb-20 sm:mb-6 md:top-4 -top-[4.75em] md:max-w-[95%] sm:w-full md:mx-auto sm:mx-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">Dashboard</h1>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate("/transactions/new")}
              className="bg-primary cursor-pointer text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-darkest transition-colors flex items-center justify-center gap-2 font-medium text-sm"
            >
              <TbCashPlus className="text-base sm:text-xl" />
              Add Transaction
            </button>
            <button
              onClick={() => navigate("/transactions")}
              className="bg-background-subtle flex items-center justify-center gap-2 cursor-pointer text-text border border-border px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary/25 transition-colors font-medium text-sm"
            >
              <HiClipboardDocumentList className="text-base sm:text-xl" />
              View All Transactions
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* All Time Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Balance Card */}
          <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-text-muted font-semibold mb-1 text-xs">All Time Balance</h3>
            <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${summary.balance >= 0 ? 'text-secondary-lightest' : 'text-secondary'}`}>
              {formatCurrency(summary.balance)}
            </p>
            <p className="text-text-muted text-[9px] mt-1.5">
              Since account creation
            </p>
          </div>

          {/* Income Card */}
          <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-text-muted font-semibold mb-1 text-xs">All Time Income</h3>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-primary break-words">
              +{formatCurrency(summary.total_income)}
            </p>
          </div>
        
          {/* Expenses Card */}
          <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
            <h3 className="text-text-muted font-semibold mb-1 text-xs">All Time Expenses</h3>
            <p className="text-base sm:text-xl md:text-2xl font-bold text-secondary break-words">
              -{formatCurrency(summary.total_expenses)}
            </p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-6">
          <div className="bg-background rounded-lg p-3 border border-border shadow-sm">
            <h3 className="text-center text-text-muted font-semibold mb-3 text-xs sm:text-sm">
              Monthly Income vs Expenses
            </h3>
            <MirroredBarChart data={displayedData} />
            
            {/* Pagination Controls - Mobile only */}
            {showPagination && (
              <div className="mt-4">
                <div className="flex justify-center items-center gap-1">
                  <button
                    onClick={goToPrevious}
                    disabled={!canGoPrevious}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded-md transition-all text-xs ${
                      canGoPrevious 
                        ? 'bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer' 
                        : 'bg-background-subtle text-text-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <TbChevronLeft className="text-sm" />
                    <span>Prev</span>
                  </button>
                  
                  <div className="flex gap-0.5 mx-1">
                    {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage === 1) {
                        pageNum = i + 1;
                      } else if (currentPage === totalPages) {
                        pageNum = totalPages - 2 + i;
                      } else {
                        pageNum = currentPage - 1 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setDisplayStartIndex((pageNum - 1) * itemsPerPage)}
                          className={`w-6 h-6 rounded-md text-[10px] transition-all ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'bg-background-subtle text-text-muted hover:bg-primary/20'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={goToNext}
                    disabled={!canGoNext}
                    className={`flex items-center gap-0.5 px-2 py-1 rounded-md transition-all text-xs ${
                      canGoNext 
                        ? 'bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer' 
                        : 'bg-background-subtle text-text-muted cursor-not-allowed opacity-50'
                    }`}
                  >
                    <span>Next</span>
                    <TbChevronRight className="text-sm" />
                  </button>
                </div>
                <p className="text-center text-text-muted text-[9px] mt-1.5">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Period Summary - Single column on mobile */}
        <div className="mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary mb-3">Period Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <PeriodCard title="Today" data={todaySummary} />
            <PeriodCard title="This Week" data={weekSummary} />
            <PeriodCard title="This Month" data={monthSummary} />
            <PeriodCard title="This Year" data={yearSummary} />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-background-subtle rounded-lg border border-border overflow-hidden">
          <div className="p-3 border-b border-border">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary">Recent Transactions</h2>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-text-muted text-sm">
              No transactions yet. Click "Add Transaction" to get started!
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-background">
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-text-muted font-medium text-xs">Name</th>
                      <th className="text-left p-3 text-text-muted font-medium text-xs">Date</th>
                      <th className="text-left p-3 text-text-muted font-medium text-xs">Description</th>
                      <th className="text-right p-3 text-text-muted font-medium text-xs">Amount</th>
                      <th className="text-center p-3 text-text-muted font-medium text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="p-3 text-text font-medium text-sm">{transaction.name}</td>
                        <td className="p-3 text-text-muted text-xs">{formatDate(transaction.budget_date)}</td>
                        <td className="p-3 text-text-muted text-xs max-w-xs truncate">
                          {transaction.description || "-"}
                        </td>
                        <td className={`p-3 text-right font-semibold text-sm whitespace-nowrap ${
                          transaction.is_income ? 'text-secondary-lightest' : 'text-secondary'
                        }`}>
                          {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
                            className="text-primary cursor-pointer hover:text-primary-darkest mr-2 text-xs transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => navigate(`/transactions/${transaction.id}`)}
                            className="text-text-muted cursor-pointer hover:text-text text-xs transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden divide-y divide-border">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-3 hover:bg-background/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-text font-semibold text-sm break-words pr-2">
                          {transaction.name}
                        </h4>
                        <p className="text-text-muted text-xs mt-1">
                          {formatDate(transaction.budget_date)}
                        </p>
                      </div>
                      <p className={`font-bold text-sm whitespace-nowrap ${
                        transaction.is_income ? 'text-secondary-lightest' : 'text-secondary'
                      }`}>
                        {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    
                    {transaction.description && (
                      <p className="text-text-muted text-xs mb-2 break-words">
                        {transaction.description}
                      </p>
                    )}
                    
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
                        className="flex-1 text-primary cursor-pointer hover:text-primary-darkest text-xs py-1 transition-colors text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => navigate(`/transactions/${transaction.id}`)}
                        className="flex-1 text-text-muted cursor-pointer hover:text-text text-xs py-1 transition-colors text-center"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {recentTransactions.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={() => navigate("/transactions")}
                className="w-full text-primary hover:text-primary-darkest py-2 rounded-md transition-colors cursor-pointer hover:bg-primary/10 font-medium text-sm"
              >
                View All Transactions →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}