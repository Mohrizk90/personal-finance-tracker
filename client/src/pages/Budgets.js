import React, { useState, useEffect, useCallback } from 'react';
import { useContexts } from '../contexts/ContextContext';
import { budgetsAPI, transactionsAPI } from '../services/api';
import BudgetModal from '../components/BudgetModal';

const Budgets = () => {
  const { selectedContext } = useContexts();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchData = useCallback(async () => {
    if (!selectedContext) return;

    try {
      setLoading(true);
      setError(null);
      
      const [budgetsRes, transactionsRes] = await Promise.all([
        budgetsAPI.getAll(selectedContext.id, selectedMonth),
        transactionsAPI.getAll(selectedContext.id)
      ]);

      setBudgets(budgetsRes.data);
      setTransactions(transactionsRes.data);
    } catch (err) {
      setError('Failed to fetch budget data');
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedContext, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (budgetData) => {
    try {
      const response = await budgetsAPI.create({
        ...budgetData,
        context_id: selectedContext.id,
        month: selectedMonth
      });
      setBudgets(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Failed to create budget');
    }
  };

  const handleUpdate = async (id, budgetData) => {
    try {
      const response = await budgetsAPI.update(id, {
        ...budgetData,
        context_id: selectedContext.id,
        month: selectedMonth
      });
      setBudgets(prev => prev.map(b => b.id === id ? response.data : b));
      return response.data;
    } catch (err) {
      throw new Error('Failed to update budget');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetsAPI.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const openEditModal = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBudget(null);
  };

  const calculateSpent = (category) => {
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === selectedMonth && 
             t.type === 'Expense' && 
             t.category === category;
    });

    return monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
  };

  const getBudgetWithSpent = (budget) => {
    const spent = calculateSpent(budget.category);
    const limit = parseFloat(budget.monthly_limit);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    
    return {
      ...budget,
      spent,
      percentage: Math.min(percentage, 100),
      remaining: limit - spent
    };
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your spending against monthly budgets
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {generateMonthOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="mr-2">+</span>
            Add Budget
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets found</h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first budget for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Add Budget
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const budgetWithSpent = getBudgetWithSpent(budget);
            return (
              <div key={budget.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {budget.category}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        Budget: {formatAmount(budget.monthly_limit)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Spent: {formatAmount(budgetWithSpent.spent)}
                      </span>
                      <span className={`text-sm font-medium ${
                        budgetWithSpent.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        Remaining: {formatAmount(budgetWithSpent.remaining)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="text-primary-600 hover:text-primary-900 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-600">
                      {budgetWithSpent.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(budgetWithSpent.percentage)}`}
                      style={{ width: `${budgetWithSpent.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {budgetWithSpent.spent >= budget.monthly_limit 
                      ? 'Over budget!' 
                      : `${formatAmount(budget.monthly_limit - budgetWithSpent.spent)} remaining`
                    }
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      {showModal && (
        <BudgetModal
          budget={editingBudget}
          onClose={closeModal}
          onSave={editingBudget ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default Budgets;
