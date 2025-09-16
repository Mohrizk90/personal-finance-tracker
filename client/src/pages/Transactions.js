import React, { useState, useEffect, useCallback } from 'react';
import { useContexts } from '../contexts/ContextContext';
import { transactionsAPI } from '../services/api';
import TransactionModal from '../components/TransactionModal';

const Transactions = () => {
  const { selectedContext } = useContexts();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchTransactions = useCallback(async () => {
    if (!selectedContext) return;

    try {
      setLoading(true);
      setError(null);
      const response = await transactionsAPI.getAll(selectedContext.id);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedContext]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCreate = async (transactionData) => {
    try {
      const response = await transactionsAPI.create({
        ...transactionData,
        context_id: selectedContext.id
      });
      setTransactions(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Failed to create transaction');
    }
  };

  const handleUpdate = async (id, transactionData) => {
    try {
      const response = await transactionsAPI.update(id, {
        ...transactionData,
        context_id: selectedContext.id
      });
      setTransactions(prev => prev.map(t => t.id === id ? response.data : t));
      return response.data;
    } catch (err) {
      throw new Error('Failed to update transaction');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionsAPI.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount, type) => {
    const numAmount = parseFloat(amount);
    return type === 'Income' ? `+$${numAmount.toFixed(2)}` : `-$${numAmount.toFixed(2)}`;
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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your income and expenses
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="mr-2">+</span>
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('Income')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'Income'
              ? 'bg-green-100 text-green-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setFilter('Expense')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'Expense'
              ? 'bg-red-100 text-red-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Expenses
        </button>
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

      {/* Transactions Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Get started by adding your first transaction.'
                : `No ${filter.toLowerCase()} transactions found.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Add Transaction
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <li key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {transaction.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.account && `${transaction.account} • `}
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`text-sm font-medium ${
                            transaction.type === 'Income'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatAmount(transaction.amount, transaction.type)}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="text-primary-600 hover:text-primary-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={closeModal}
          onSave={editingTransaction ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default Transactions;
