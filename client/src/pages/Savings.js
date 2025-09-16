import React, { useState, useEffect, useCallback } from 'react';
import { useContexts } from '../contexts/ContextContext';
import { savingsAPI } from '../services/api';
import SavingsModal from '../components/SavingsModal';

const Savings = () => {
  const { selectedContext } = useContexts();
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSaving, setEditingSaving] = useState(null);

  const fetchSavings = useCallback(async () => {
    if (!selectedContext) return;

    try {
      setLoading(true);
      setError(null);
      const response = await savingsAPI.getAll(selectedContext.id);
      setSavings(response.data);
    } catch (err) {
      setError('Failed to fetch savings');
      console.error('Error fetching savings:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedContext]);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const handleCreate = async (savingData) => {
    try {
      const response = await savingsAPI.create({
        ...savingData,
        context_id: selectedContext.id
      });
      setSavings(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Failed to create savings record');
    }
  };

  const handleUpdate = async (id, savingData) => {
    try {
      const response = await savingsAPI.update(id, {
        ...savingData,
        context_id: selectedContext.id
      });
      setSavings(prev => prev.map(s => s.id === id ? response.data : s));
      return response.data;
    } catch (err) {
      throw new Error('Failed to update savings record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings record?')) {
      return;
    }

    try {
      await savingsAPI.delete(id);
      setSavings(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Failed to delete savings record');
    }
  };

  const openEditModal = (saving) => {
    setEditingSaving(saving);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSaving(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Group savings by account
  const groupedSavings = savings.reduce((acc, saving) => {
    const account = saving.account || 'General';
    if (!acc[account]) {
      acc[account] = {
        account,
        records: [],
        totalAmount: 0,
        totalGoal: 0
      };
    }
    acc[account].records.push(saving);
    acc[account].totalAmount += parseFloat(saving.amount || 0);
    acc[account].totalGoal += parseFloat(saving.goal || 0);
    return acc;
  }, {});

  const getProgressPercentage = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
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
          <h1 className="text-2xl font-bold text-gray-900">Savings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your savings progress and goals
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="mr-2">+</span>
            Add Savings
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

      {/* Savings by Account */}
      {Object.keys(groupedSavings).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No savings records found</h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first savings record.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Add Savings
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedSavings).map((group) => (
            <div key={group.account} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{group.account}</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Saved</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatAmount(group.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {group.totalGoal > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress to Goal</span>
                    <span className="text-gray-600">
                      {formatAmount(group.totalAmount)} / {formatAmount(group.totalGoal)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(group.totalAmount, group.totalGoal)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getProgressPercentage(group.totalAmount, group.totalGoal).toFixed(1)}% of goal
                  </div>
                </div>
              )}

              {/* Savings Records */}
              <div className="space-y-3">
                {group.records.map((saving) => (
                  <div key={saving.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatAmount(saving.amount)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(saving.date)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {saving.goal && (
                            <div className="text-xs text-gray-500">
                              Goal: {formatAmount(saving.goal)}
                            </div>
                          )}
                          <button
                            onClick={() => openEditModal(saving)}
                            className="text-primary-600 hover:text-primary-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(saving.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Savings Modal */}
      {showModal && (
        <SavingsModal
          saving={editingSaving}
          onClose={closeModal}
          onSave={editingSaving ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default Savings;
