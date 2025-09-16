import React, { useState, useEffect, useCallback } from 'react';
import { useContexts } from '../contexts/ContextContext';
import { subscriptionsAPI } from '../services/api';
import SubscriptionModal from '../components/SubscriptionModal';

const Subscriptions = () => {
  const { selectedContext } = useContexts();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchSubscriptions = useCallback(async () => {
    if (!selectedContext) return;

    try {
      setLoading(true);
      setError(null);
      const response = await subscriptionsAPI.getAll(selectedContext.id);
      setSubscriptions(response.data);
    } catch (err) {
      setError('Failed to fetch subscriptions');
      console.error('Error fetching subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedContext]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCreate = async (subscriptionData) => {
    try {
      const response = await subscriptionsAPI.create({
        ...subscriptionData,
        context_id: selectedContext.id
      });
      setSubscriptions(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      throw new Error('Failed to create subscription');
    }
  };

  const handleUpdate = async (id, subscriptionData) => {
    try {
      const response = await subscriptionsAPI.update(id, {
        ...subscriptionData,
        context_id: selectedContext.id
      });
      setSubscriptions(prev => prev.map(s => s.id === id ? response.data : s));
      return response.data;
    } catch (err) {
      throw new Error('Failed to update subscription');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      await subscriptionsAPI.delete(id);
      setSubscriptions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError('Failed to delete subscription');
    }
  };

  const openEditModal = (subscription) => {
    setEditingSubscription(subscription);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSubscription(null);
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    if (filter === 'all') return true;
    return subscription.status === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getFrequencyText = (frequency) => {
    const frequencyMap = {
      'monthly': 'Monthly',
      'yearly': 'Yearly',
      'weekly': 'Weekly',
      'daily': 'Daily'
    };
    return frequencyMap[frequency] || frequency;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your recurring subscriptions and services
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="mr-2">+</span>
            Add Subscription
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
          onClick={() => setFilter('Active')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'Active'
              ? 'bg-green-100 text-green-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('Paused')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'Paused'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Paused
        </button>
        <button
          onClick={() => setFilter('Cancelled')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'Cancelled'
              ? 'bg-red-100 text-red-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Cancelled
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

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubscriptions.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'Get started by adding your first subscription.'
                : `No ${filter.toLowerCase()} subscriptions found.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Add Subscription
              </button>
            )}
          </div>
        ) : (
          filteredSubscriptions.map((subscription) => (
            <div key={subscription.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {subscription.service}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(subscription)}
                    className="text-primary-600 hover:text-primary-900 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Amount</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatAmount(subscription.amount)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Frequency</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getFrequencyText(subscription.frequency)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Next Billing</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(subscription.next_billing_date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Subscription Modal */}
      {showModal && (
        <SubscriptionModal
          subscription={editingSubscription}
          onClose={closeModal}
          onSave={editingSubscription ? handleUpdate : handleCreate}
        />
      )}
    </div>
  );
};

export default Subscriptions;
