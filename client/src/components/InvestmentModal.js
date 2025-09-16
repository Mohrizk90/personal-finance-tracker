import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useContexts } from '../contexts/ContextContext';

const InvestmentModal = ({ investment, onClose, onSave }) => {
  const { selectedContext } = useContexts();
  const theme = useTheme(selectedContext?.type || 'Home');
  const [formData, setFormData] = useState({
    asset_name: '',
    type: 'Stock',
    amount_invested: '',
    current_value: '',
    date_invested: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (investment) {
      setFormData({
        asset_name: investment.asset_name || '',
        type: investment.type || 'Stock',
        amount_invested: investment.amount_invested || '',
        current_value: investment.current_value || '',
        date_invested: investment.date_invested || '',
        notes: investment.notes || ''
      });
    } else {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date_invested: today }));
    }
  }, [investment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.asset_name || !formData.type || !formData.amount_invested || !formData.date_invested) {
      setError('Asset name, type, amount invested, and date are required');
      return;
    }

    if (isNaN(parseFloat(formData.amount_invested)) || parseFloat(formData.amount_invested) <= 0) {
      setError('Amount invested must be a positive number');
      return;
    }

    if (formData.current_value && (isNaN(parseFloat(formData.current_value)) || parseFloat(formData.current_value) < 0)) {
      setError('Current value must be a non-negative number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      if (investment) {
        await onSave(investment.id, formData);
      } else {
        await onSave(formData);
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save investment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const investmentTypes = [
    { value: 'Stock', label: 'Stock' },
    { value: 'Crypto', label: 'Cryptocurrency' },
    { value: 'Mutual Fund', label: 'Mutual Fund' },
    { value: 'Property', label: 'Property' },
    { value: 'Bond', label: 'Bond' },
    { value: 'ETF', label: 'ETF' },
    { value: 'Other', label: 'Other' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center mr-3`}>
                <span className="text-white text-lg">{theme.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {investment ? 'Edit Investment' : 'Add Investment'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <span className="sr-only">Close</span>
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="asset_name" className="block text-sm font-semibold text-gray-700 mb-2">
                Asset Name *
              </label>
              <input
                type="text"
                id="asset_name"
                name="asset_name"
                value={formData.asset_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                placeholder="e.g., Apple Inc., Bitcoin, Vanguard S&P 500"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
              >
                {investmentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="amount_invested" className="block text-sm font-semibold text-gray-700 mb-2">
                Amount Invested *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-semibold">$</span>
                </div>
                <input
                  type="number"
                  id="amount_invested"
                  name="amount_invested"
                  value={formData.amount_invested}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="current_value" className="block text-sm font-semibold text-gray-700 mb-2">
                Current Value
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-semibold">$</span>
                </div>
                <input
                  type="number"
                  id="current_value"
                  name="current_value"
                  value={formData.current_value}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                💡 Leave empty to default to amount invested
              </p>
            </div>

            <div>
              <label htmlFor="date_invested" className="block text-sm font-semibold text-gray-700 mb-2">
                Date Invested *
              </label>
              <input
                type="date"
                id="date_invested"
                name="date_invested"
                value={formData.date_invested}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none"
                placeholder="Additional details about this investment..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
                <span className="mr-2">⚠️</span>
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r ${theme.gradient} border border-transparent rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 shadow-lg`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  investment ? 'Update Investment' : 'Create Investment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvestmentModal;
