import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { TbPlus, TbSearch, TbFilter, TbEye, TbTrash, TbCalendar, TbCurrencyDollar, TbX } from "react-icons/tb";
import { UseCurrency } from "../hooks/UseCurrency";
import WealthSmartBG from '../assets/WealthSmartBG.png';

export default function BudgetEstimatesList() {
  const navigate = useNavigate();
  const { formatCurrency } = UseCurrency();
  const [estimations, setEstimations] = useState([]);
  const [filteredEstimations, setFilteredEstimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEstimations();
  }, []);

  useEffect(() => {
    filterAndSortEstimations();
  }, [estimations, searchTerm, filterType, sortBy, dateRange]);

  const fetchEstimations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/budget-estimations");
      
      let estimations = [];
      if (response.data && response.data.data) {
        estimations = response.data.data;
      } else if (Array.isArray(response.data)) {
        estimations = response.data;
      } else if (response.data && Array.isArray(response.data.estimations)) {
        estimations = response.data.estimations;
      }
      
      setEstimations(estimations);
      setFilteredEstimations(estimations);
    } catch (err) {
      console.error("Error fetching budget estimations:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to load budget estimations");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEstimations = () => {
    let filtered = [...estimations];

    if (searchTerm) {
      filtered = filtered.filter(est => 
        est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (est.description && est.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (dateRange.start) {
      filtered = filtered.filter(est => new Date(est.created_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(est => new Date(est.created_at) <= new Date(dateRange.end));
    }

    if (filterType !== "all") {
      filtered = filtered.filter(est => {
        const breakdown = calculateBreakdown(est);
        if (filterType === "sufficient") return breakdown.isOverallSufficient;
        if (filterType === "insufficient") return !breakdown.isOverallSufficient;
        return true;
      });
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "budget":
        filtered.sort((a, b) => (b.current_budget || 0) - (a.current_budget || 0));
        break;
      default:
        break;
    }

    setFilteredEstimations(filtered);
  };

  const calculateBreakdown = (estimation) => {
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
    
    return {
      totalExpenses,
      maxDays,
      currentBudget,
      overallTotalExpensesMaxSpan: totalExpenses * maxDays,
      isOverallSufficient: currentBudget >= (totalExpenses * maxDays)
    };
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/budget-estimations/${deletingId}`);
      setShowDeleteModal(false);
      setDeletingId(null);
      fetchEstimations();
    } catch (err) {
      console.error("Error deleting budget estimation:", err);
      setError(err.response?.data?.error || "Failed to delete budget estimation");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
            Are you sure you want to delete this budget estimation? This action cannot be undone.
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

  // Filter Modal for mobile
  const FilterModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary">Filters & Sorting</h2>
          <button
            onClick={() => setShowFilters(false)}
            className="text-text-muted hover:text-text transition-colors"
          >
            <TbX className="text-2xl" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-text-muted text-sm mb-2">Status</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
            >
              <option value="all">All</option>
              <option value="sufficient">Sufficient</option>
              <option value="insufficient">Insufficient</option>
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
              <option value="budget">Highest Budget</option>
            </select>
          </div>
          <div>
            <label className="block text-text-muted text-sm mb-2">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
                placeholder="End Date"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
                setSortBy("newest");
                setDateRange({ start: "", end: "" });
                setShowFilters(false);
              }}
              className="w-full px-4 py-2 bg-background-subtle text-text border border-border rounded-lg hover:bg-background transition-colors cursor-pointer text-sm"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading budget estimations...</div>
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
      <div className="relative backdrop-blur-[3px] z-10 mx-auto bg-secondary-darkest/90 border rounded-lg p-3 sm:p-6 mb-20 sm:mb-6 md:top-4 -top-[4.75em] md:max-w-[95%] sm:w-full md:mx-auto sm:mx-none">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">Budget Estimations</h1>
          <button
            onClick={() => navigate("/budget-estimator")}
            className="w-full sm:w-auto bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
          >
            <TbPlus className="text-base sm:text-xl" />
            New Estimation
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-background rounded-lg border border-border p-3 sm:p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <TbSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-base" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-background-subtle border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-background-subtle text-text border border-border rounded-lg hover:bg-background transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <TbFilter className="text-base" />
              Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {(filterType !== "all" || sortBy !== "newest" || dateRange.start || dateRange.end) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
              {filterType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  Status: {filterType === "sufficient" ? "Sufficient" : "Insufficient"}
                  <button onClick={() => setFilterType("all")} className="hover:text-primary-darkest">
                    <TbX className="text-xs" />
                  </button>
                </span>
              )}
              {sortBy !== "newest" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  Sort: {sortBy === "oldest" ? "Oldest" : sortBy === "name" ? "Name A-Z" : "Highest Budget"}
                  <button onClick={() => setSortBy("newest")} className="hover:text-primary-darkest">
                    <TbX className="text-xs" />
                  </button>
                </span>
              )}
              {(dateRange.start || dateRange.end) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  Date filtered
                  <button onClick={() => setDateRange({ start: "", end: "" })} className="hover:text-primary-darkest">
                    <TbX className="text-xs" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-text-muted text-sm">
          Found {filteredEstimations.length} estimation{filteredEstimations.length !== 1 ? 's' : ''}
        </div>

        {/* Estimations List */}
        {filteredEstimations.length === 0 ? (
          <div className="bg-background-subtle rounded-lg border border-border p-8 sm:p-12 text-center">
            <p className="text-text-muted mb-4 text-sm">No budget estimations found</p>
            <button
              onClick={() => navigate("/budget-estimator")}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer inline-flex items-center gap-2 text-sm"
            >
              <TbPlus />
              Create Your First Estimation
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEstimations.map((estimation) => {
              const breakdown = calculateBreakdown(estimation);
              return (
                <div
                  key={estimation.id}
                  className="bg-background rounded-lg border border-border p-3 sm:p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-primary">{estimation.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                          breakdown.isOverallSufficient
                            ? 'bg-green-500/10 text-secondary-lightest'
                            : 'bg-red-500/10 text-secondary'
                        }`}>
                          {breakdown.isOverallSufficient ? 'Sufficient' : 'Insufficient'}
                        </span>
                      </div>
                      {estimation.description && (
                        <p className="text-text-muted text-xs sm:text-sm mb-2 line-clamp-2">{estimation.description}</p>
                      )}
                      <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 text-text-muted">
                          <TbCurrencyDollar className="text-sm" />
                          <span>Budget: {formatCurrency(estimation.current_budget)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-muted">
                          <TbCalendar className="text-sm" />
                          <span>Created: {formatDate(estimation.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-text-muted">
                          <span>Expenses: {formatCurrency(breakdown.overallTotalExpensesMaxSpan)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-border sm:border-t-0 sm:pt-0 justify-end">
                      <button
                        onClick={() => navigate(`/budget-estimates/${estimation.id}`)}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 text-sm"
                      >
                        <TbEye className="text-base" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setDeletingId(estimation.id);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 sm:flex-none px-3 py-1.5 text-secondary hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 text-sm"
                      >
                        <TbTrash className="text-base" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Modal for Mobile */}
      {showFilters && <FilterModal />}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmModal />}
    </div>
  );
}