import React, { useState, useEffect, useCallback } from 'react';
import { useContexts } from '../contexts/ContextContext';
import { investmentsAPI } from '../services/api';
import InvestmentModal from '../components/InvestmentModal';
import { useTheme } from '../hooks/useTheme';

const Investments = () => {
  const { selectedContext } = useContexts();
  const theme = useTheme(selectedContext?.type || 'Home');
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchInvestments = useCallback(async () => {
    if (!selectedContext) return;

    try {
      setLoading(true);
      setError(null);
      const response = await investmentsAPI.getAll(selectedContext.id);
      setInvestments(response.data);
    } catch (err) {
      setError('Failed to fetch investments');
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedContext]);

  useEffect(() => {
    fetchInvestments();
  }, [selectedContext, fetchInvestments]);

  const handleCreate = async (investmentData) => {
    try {
      const response = await investmentsAPI.create({
        ...investmentData,
        context_id: selectedContext.id
      });
      setInvestments(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Failed to create investment');
    }
  };

  const handleUpdate = async (id, investmentData) => {
    try {
      const response = await investmentsAPI.update(id, {
        ...investmentData,
        context_id: selectedContext.id
      });
      setInvestments(prev => prev.map(i => i.id === id ? response.data : i));
      return response.data;
    } catch (err) {
      throw new Error('Failed to update investment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) {
      return;
    }

    try {
      await investmentsAPI.delete(id);
      setInvestments(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError('Failed to delete investment');
    }
  };

  const openEditModal = (investment) => {
    setEditingInvestment(investment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingInvestment(null);
  };

  const filteredInvestments = investments.filter(investment => {
    if (filter === 'all') return true;
    return investment.type === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const calculateProfitLoss = (invested, current) => {
    const investedAmount = parseFloat(invested);
    const currentAmount = parseFloat(current);
    const difference = currentAmount - investedAmount;
    const percentage = investedAmount > 0 ? (difference / investedAmount) * 100 : 0;
    return { amount: difference, percentage };
  };

  const getTotalInvested = () => {
    return investments.reduce((sum, investment) => sum + parseFloat(investment.amount_invested || 0), 0);
  };

  const getTotalCurrentValue = () => {
    return investments.reduce((sum, investment) => sum + parseFloat(investment.current_value || 0), 0);
  };

  const getTotalProfitLoss = () => {
    const totalInvested = getTotalInvested();
    const totalCurrent = getTotalCurrentValue();
    return calculateProfitLoss(totalInvested, totalCurrent);
  };

  const getTypeColor = (type) => {
    const colors = {
      'Stock': 'bg-blue-100 text-blue-800',
      'Crypto': 'bg-yellow-100 text-yellow-800',
      'Mutual Fund': 'bg-green-100 text-green-800',
      'Property': 'bg-purple-100 text-purple-800',
      'Bond': 'bg-indigo-100 text-indigo-800',
      'ETF': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalProfitLoss = getTotalProfitLoss();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between animate-slide-up">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Investments</h1>
          <p className="mt-2 text-gray-600">
            Track your investment portfolio and performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 hover-lift animate-bounce-in`}
          >
            <span className="mr-2 text-lg">+</span>
            Add Investment
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Invested</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">{formatAmount(getTotalInvested())}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-white text-xl">📈</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Value</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">{formatAmount(getTotalCurrentValue())}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow ${totalProfitLoss.amount >= 0 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'}`}>
                  <span className="text-white text-xl">💎</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Profit/Loss</dt>
                  <dd className={`text-2xl font-bold mt-1 ${totalProfitLoss.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatAmount(totalProfitLoss.amount)} ({totalProfitLoss.percentage.toFixed(1)}%)
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover-lift ${
            filter === 'all'
              ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg animate-glow`
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 border border-gray-200'
          }`}
        >
          All
        </button>
        {['Stock', 'Crypto', 'Mutual Fund', 'Property', 'Bond', 'ETF', 'Other'].map((type, index) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover-lift ${
              filter === type
                ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg animate-glow`
                : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 border border-gray-200'
            }`}
            style={{ animationDelay: `${0.5 + index * 0.05}s` }}
          >
            {type}
          </button>
        ))}
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

      {/* Investments Table */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden rounded-2xl border border-gray-100 animate-slide-up" style={{ animationDelay: '0.6s' }}>
        {filteredInvestments.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-gray-400 text-8xl mb-6 animate-float">💎</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No investments found</h3>
            <p className="text-gray-500 mb-6 text-lg">
              {filter === 'all' 
                ? 'Get started by adding your first investment.'
                : `No ${filter.toLowerCase()} investments found.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 hover-lift"
              >
                <span className="mr-2 text-lg">+</span>
                Add Investment
              </button>
            )}
          </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Invested
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Profit/Loss
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestments.map((investment) => {
                  const profitLoss = calculateProfitLoss(investment.amount_invested, investment.current_value);
                  return (
                    <tr key={investment.id} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 animate-fade-in">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {investment.asset_name}
                          </div>
                          {investment.notes && (
                            <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                              {investment.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getTypeColor(investment.type)}`}>
                          {investment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatAmount(investment.amount_invested)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatAmount(investment.current_value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-bold ${profitLoss.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(profitLoss.amount)} ({profitLoss.percentage.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {formatDate(investment.date_invested)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openEditModal(investment)}
                            className="text-primary-600 hover:text-primary-800 font-semibold transition-colors duration-200 hover:scale-105"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(investment.id)}
                            className="text-red-600 hover:text-red-800 font-semibold transition-colors duration-200 hover:scale-105"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Investment Modal */}
      {showModal && (
        <InvestmentModal
          investment={editingInvestment}
          onClose={closeModal}
          onSave={editingInvestment ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default Investments;
