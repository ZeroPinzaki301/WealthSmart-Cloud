import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import WealthSmartBG from "../assets/WealthSmartBG.png";
import { UseCurrency } from "../hooks/UseCurrency";
import { 
  TbArrowLeft, 
  TbEdit, 
  TbTrash, 
  TbCash, 
  TbCalendar, 
  TbFileDescription, 
  TbClock, 
  TbRefresh 
} from "react-icons/tb";

export default function ViewTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { formatCurrency, currency } = UseCurrency();

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/budgets/my/${id}`);
      setTransaction(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching transaction:", err);
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        setError(err.response?.data?.error || "Failed to load transaction");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/budgets/${id}`);
      navigate("/transactions");
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Delete Confirmation Modal
  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TbTrash className="text-3xl text-secondary" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Delete Transaction?</h2>
          <p className="text-text-muted mb-6 text-sm">
            Are you sure you want to delete "{transaction?.name}"? This action cannot be undone.
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
              Delete Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-text-muted">Loading transaction...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-secondary/10 border border-secondary text-secondary rounded-lg p-4 text-sm">
            {error || "Transaction not found"}
          </div>
          <button
            onClick={() => navigate("/transactions")}
            className="mt-4 text-primary hover:text-primary-darkest transition-colors cursor-pointer flex items-center gap-2"
          >
            <TbArrowLeft className="text-lg" />
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-0">
      {/* Background Image */}
      <div 
        className="absolute fixed inset-0 bg-secondary z-0"
        style={{
          maskImage: `url(${WealthSmartBG})`,
          maskSize: 'cover',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          height: '100vh',
        }}
      />
      
      {/* Transaction Container */}
      <div className="relative md:top-4 -top-[4.75em] backdrop-blur-[3px] z-10 max-w-[95%] mt-3 sm:mt-[12px] mx-auto bg-secondary-darkest/90 border rounded-lg p-3 sm:p-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/transactions")}
              className="text-text-muted hover:text-text transition-colors cursor-pointer p-1"
            >
              <TbArrowLeft className="text-xl sm:text-2xl" />
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">Transaction Details</h1>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate(`/transactions/${id}/edit`)}
              className="flex-1 sm:flex-none bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <TbEdit className="text-lg sm:text-xl" />
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex-1 sm:flex-none bg-secondary/20 text-secondary px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <TbTrash className="text-lg sm:text-xl" />
              Delete
            </button>
          </div>
        </div>

        {/* Transaction Card */}
        <div className="bg-background-subtle rounded-lg border border-border overflow-hidden">
          {/* Amount Header */}
          <div className={`p-4 sm:p-6 text-center border-b border-border ${
            transaction.is_income ? 'bg-primary/5' : 'bg-secondary/5'
          }`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 mb-3">
              <TbCash className={`text-sm ${transaction.is_income ? 'text-primary' : 'text-secondary'}`} />
              <span className={`text-xs font-semibold ${
                transaction.is_income ? 'text-primary' : 'text-secondary'
              }`}>
                {transaction.is_income ? 'INCOME' : 'EXPENSE'}
              </span>
            </div>
            <p className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
              transaction.is_income ? 'text-primary' : 'text-secondary'
            }`}>
              {transaction.is_income ? '+' : '-'}{formatCurrency(transaction.amount)}
            </p>
          </div>

          {/* Details Section */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Name */}
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TbCash className="text-primary text-base" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">Transaction Name</label>
                <p className="text-sm sm:text-base text-text font-medium break-words">{transaction.name}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TbCalendar className="text-primary text-base" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">Date</label>
                <p className="text-sm sm:text-base text-text">{formatDate(transaction.budget_date)}</p>
              </div>
            </div>

            {/* Description */}
            {transaction.description && (
              <div className="flex items-start gap-3 pb-3 border-b border-border">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TbFileDescription className="text-primary text-base" />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-muted block mb-1">Description</label>
                  <p className="text-sm sm:text-base text-text whitespace-pre-wrap break-words">
                    {transaction.description}
                  </p>
                </div>
              </div>
            )}

            {/* Created At */}
            <div className="flex items-start gap-3 pb-3 border-b border-border">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TbClock className="text-primary text-base" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">Created At</label>
                <p className="text-sm sm:text-base text-text">{formatDateTime(transaction.created_at)}</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TbRefresh className="text-primary text-base" />
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-text-muted block mb-1">Last Updated</label>
                <p className="text-sm sm:text-base text-text">{formatDateTime(transaction.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteModal />}
    </div>
  );
}