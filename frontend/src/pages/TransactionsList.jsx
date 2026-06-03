import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import WealthSmartBG from "../assets/WealthSmartBG.png";
import { UseCurrency } from "../hooks/UseCurrency";
import { TbCashPlus, TbEdit, TbEye, TbTrash, TbFilter, TbX } from "react-icons/tb";
import { HiClipboardDocumentList } from "react-icons/hi2";

export default function TransactionsList() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const { formatCurrency, currency } = UseCurrency();

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = "/budgets/my";
      
      if (filter === "income") {
        url = "/budgets/my/type/income";
      } else if (filter === "expense") {
        url = "/budgets/my/type/expense";
      }
      
      const response = await axiosInstance.get(url);
      
      let transactionsData = [];
      if (response.data && response.data.data) {
        transactionsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        transactionsData = response.data;
      } else if (response.data && Array.isArray(response.data.transactions)) {
        transactionsData = response.data.transactions;
      }
      
      setTransactions(transactionsData);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to load transactions");
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;
    
    try {
      await axiosInstance.delete(`/budgets/${deletingTransaction.id}`);
      setShowDeleteModal(false);
      setDeletingTransaction(null);
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        alert("Failed to delete transaction");
      }
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

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TbTrash className="text-3xl text-secondary" />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">Delete Transaction?</h3>
          <p className="text-text-muted mb-6 text-sm">
            Are you sure you want to delete "{deletingTransaction?.name}"? This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeletingTransaction(null);
              }}
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

  // Filter Modal Component for mobile
  const FilterModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-primary">Filter Transactions</h2>
          <button
            onClick={() => setShowFilterModal(false)}
            className="text-text-muted hover:text-text transition-colors"
          >
            <TbX className="text-2xl" />
          </button>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              setFilter("all");
              setShowFilterModal(false);
            }}
            className={`w-full px-4 py-3 rounded-lg transition-colors text-left text-sm ${
              filter === "all" 
                ? "bg-primary text-white" 
                : "bg-background-subtle text-text hover:bg-background"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => {
              setFilter("income");
              setShowFilterModal(false);
            }}
            className={`w-full px-4 py-3 rounded-lg transition-colors text-left text-sm ${
              filter === "income" 
                ? "bg-primary text-white" 
                : "bg-background-subtle text-text hover:bg-background"
            }`}
          >
            Income Only
          </button>
          <button
            onClick={() => {
              setFilter("expense");
              setShowFilterModal(false);
            }}
            className={`w-full px-4 py-3 rounded-lg transition-colors text-left text-sm ${
              filter === "expense" 
                ? "bg-secondary text-white" 
                : "bg-background-subtle text-text hover:bg-background"
            }`}
          >
            Expenses Only
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Loading transactions...</div>
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
      
      {/* Transactions Container */}
      <div className="relative backdrop-blur-[3px] z-10 max-w-[95%] mx-auto bg-secondary-darkest/90 border rounded-lg p-3 sm:p-6 mb-20 sm:mb-6 md:top-4 -top-[4.75em]">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">All Transactions</h1>
          
          <button
            onClick={() => navigate("/transactions/new")}
            className="w-full sm:w-auto bg-primary cursor-pointer text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-darkest transition-colors flex items-center justify-center gap-2 font-medium text-sm"
          >
            <TbCashPlus className="text-base sm:text-xl" />
            Add Transaction
          </button>
        </div>

        {/* Filter Buttons - Desktop */}
        <div className="hidden sm:flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              filter === "all" 
                ? "bg-primary text-white" 
                : "bg-background-subtle text-text hover:bg-background border border-border"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              filter === "income" 
                ? "bg-primary text-white" 
                : "bg-background-subtle text-text hover:bg-background border border-border"
            }`}
          >
            Income Only
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              filter === "expense" 
                ? "bg-secondary text-white" 
                : "bg-background-subtle text-text hover:bg-background border border-border"
            }`}
          >
            Expenses Only
          </button>
        </div>

        {/* Filter Button - Mobile */}
        <div className="sm:hidden mb-4">
          <button
            onClick={() => setShowFilterModal(true)}
            className="w-full bg-background-subtle border border-border rounded-lg px-4 py-2 text-text flex items-center justify-center gap-2 text-sm"
          >
            <TbFilter className="text-base" />
            Filter: {filter === "all" ? "All" : filter === "income" ? "Income" : "Expenses"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {!transactions || transactions.length === 0 ? (
          <div className="bg-background-subtle rounded-lg p-8 sm:p-12 text-center border border-border">
            <p className="text-text-muted mb-4 text-sm">No transactions found</p>
            <button
              onClick={() => navigate("/transactions/new")}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer inline-flex items-center gap-2 text-sm"
            >
              <TbCashPlus className="text-base" />
              Add Your First Transaction
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block bg-background-subtle rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
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
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="p-3 text-text font-medium text-sm break-words">{transaction.name}</td>
                        <td className="p-3 text-text-muted text-xs whitespace-nowrap">{formatDate(transaction.budget_date)}</td>
                        <td className="p-3 text-text-muted text-sm max-w-md truncate">
                          {transaction.description || "-"}
                        </td>
                        <td className={`p-3 text-right font-semibold text-sm whitespace-nowrap ${
                          transaction.is_income ? 'text-primary' : 'text-secondary'
                        }`}>
                          {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
                              className="text-primary cursor-pointer hover:text-primary-darkest transition-colors p-1"
                              title="Edit"
                            >
                              <TbEdit className="text-base" />
                            </button>
                            <button
                              onClick={() => navigate(`/transactions/${transaction.id}`)}
                              className="text-text-muted cursor-pointer hover:text-text transition-colors p-1"
                              title="View"
                            >
                              <TbEye className="text-base" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingTransaction(transaction);
                                setShowDeleteModal(true);
                              }}
                              className="text-secondary cursor-pointer hover:text-secondary-darkest transition-colors p-1"
                              title="Delete"
                            >
                              <TbTrash className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-background-subtle rounded-lg border border-border p-3 hover:bg-background/50 transition-colors">
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
                      transaction.is_income ? 'text-primary' : 'text-secondary'
                    }`}>
                      {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  
                  {transaction.description && (
                    <p className="text-text-muted text-xs mb-3 break-words">
                      {transaction.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2 pt-2 border-t border-border mt-2">
                    <button
                      onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
                      className="flex-1 text-primary cursor-pointer hover:text-primary-darkest text-xs py-2 transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <TbEdit className="text-sm" />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/transactions/${transaction.id}`)}
                      className="flex-1 text-text-muted cursor-pointer hover:text-text text-xs py-2 transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <TbEye className="text-sm" />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setDeletingTransaction(transaction);
                        setShowDeleteModal(true);
                      }}
                      className="flex-1 text-secondary cursor-pointer hover:text-secondary-darkest text-xs py-2 transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <TbTrash className="text-sm" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Transaction Count */}
            <div className="mt-4 text-center text-text-muted text-[10px] sm:text-xs">
              Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>

      {/* Filter Modal for Mobile */}
      {showFilterModal && <FilterModal />}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmModal />}
    </div>
  );
}