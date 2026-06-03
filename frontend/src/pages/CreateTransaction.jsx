import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import WealthSmartBG from '../assets/WealthSmartBG.png';
import { TbArrowLeft, TbCash, TbCalendar, TbFileDescription, TbDeviceFloppy, TbX } from "react-icons/tb";

export default function CreateTransaction() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    description: "",
    budget_date: new Date().toISOString().split('T')[0],
    is_income: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post("/budgets", {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      if (response.data.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error creating transaction:", err);
      setError(err.response?.data?.error || "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="relative backdrop-blur-[3px] md:top-4 -top-[4.75em] z-10 max-w-[95%] mx-auto bg-secondary-darkest/90 border rounded-lg p-3 sm:p-6 mb-20 sm:mb-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-text-muted hover:text-text transition-colors cursor-pointer p-1"
            >
              <TbArrowLeft className="text-xl sm:text-2xl" />
            </button>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">Add Transaction</h1>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto text-text-muted hover:text-text transition-colors cursor-pointer text-sm"
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-background-subtle rounded-lg border border-border overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            {/* Transaction Type */}
            <div>
              <label className="block text-text font-medium mb-2 text-sm sm:text-base">
                Transaction Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="is_income"
                    value="false"
                    checked={!formData.is_income}
                    onChange={() => setFormData(prev => ({ ...prev, is_income: false }))}
                    className="mr-2 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text text-sm sm:text-base">Expense</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="is_income"
                    value="true"
                    checked={formData.is_income}
                    onChange={() => setFormData(prev => ({ ...prev, is_income: true }))}
                    className="mr-2 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-text text-sm sm:text-base">Income</span>
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-text font-medium mb-2 text-sm sm:text-base">
                Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TbCash className="text-text-muted text-base" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm sm:text-base"
                  placeholder="e.g., Groceries, Salary, Rent"
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-text font-medium mb-2 text-sm sm:text-base">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                required
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm sm:text-base"
                placeholder="0.00"
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="budget_date" className="block text-text font-medium mb-2 text-sm sm:text-base">
                Date *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TbCalendar className="text-text-muted text-base" />
                </div>
                <input
                  type="date"
                  id="budget_date"
                  name="budget_date"
                  required
                  value={formData.budget_date}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-text font-medium mb-2 text-sm sm:text-base">
                Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <TbFileDescription className="text-text-muted text-base" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm sm:text-base"
                  placeholder="Optional description..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-primary-darkest transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <TbDeviceFloppy className="text-base sm:text-lg" />
                {loading ? "Creating..." : "Create Transaction"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 cursor-pointer bg-background-subtle text-text border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}