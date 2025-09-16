import React, { useState, useEffect, useCallback } from 'react';
import { useContexts } from '../contexts/ContextContext';
import { transactionsAPI, subscriptionsAPI, savingsAPI, budgetsAPI, investmentsAPI } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useTheme } from '../hooks/useTheme';

const Dashboard = () => {
  const { selectedContext } = useContexts();
  const theme = useTheme(selectedContext?.type || 'Home');
  const [dashboardData, setDashboardData] = useState({
    transactions: [],
    subscriptions: [],
    savings: [],
    budgets: [],
    investments: [],
    loading: true,
    error: null
  });

  const fetchDashboardData = useCallback(async () => {
    if (!selectedContext) return;

    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));
      
      const [transactionsRes, subscriptionsRes, savingsRes, budgetsRes, investmentsRes] = await Promise.all([
        transactionsAPI.getAll(selectedContext.id),
        subscriptionsAPI.getAll(selectedContext.id),
        savingsAPI.getAll(selectedContext.id),
        budgetsAPI.getAll(selectedContext.id),
        investmentsAPI.getAll(selectedContext.id)
      ]);

      setDashboardData({
        transactions: transactionsRes.data,
        subscriptions: subscriptionsRes.data,
        savings: savingsRes.data,
        budgets: budgetsRes.data,
        investments: investmentsRes.data,
        loading: false,
        error: null
      });
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data'
      }));
    }
  }, [selectedContext]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedContext, fetchDashboardData]);

  const calculateTotals = () => {
    const { transactions, subscriptions, savings, investments } = dashboardData;
    
    const totalIncome = transactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    
    const totalSubscriptions = subscriptions
      .filter(s => s.status === 'Active')
      .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    
    const totalSavings = savings
      .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

    const totalInvested = investments
      .reduce((sum, i) => sum + parseFloat(i.amount_invested || 0), 0);
    
    const totalInvestmentValue = investments
      .reduce((sum, i) => sum + parseFloat(i.current_value || 0), 0);
    
    const investmentProfitLoss = totalInvestmentValue - totalInvested;

    return {
      totalIncome,
      totalExpenses,
      totalSubscriptions,
      totalSavings,
      totalInvested,
      totalInvestmentValue,
      investmentProfitLoss,
      netIncome: totalIncome - totalExpenses
    };
  };

  const getCategoryData = () => {
    const { transactions } = dashboardData;
    const categoryTotals = {};
    
    transactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        const category = t.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(t.amount || 0);
      });

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  };

  const getIncomeExpenseData = () => {
    const { transactions } = dashboardData;
    const monthlyData = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      if (t.type === 'Income') {
        monthlyData[monthKey].income += parseFloat(t.amount || 0);
      } else {
        monthlyData[monthKey].expenses += parseFloat(t.amount || 0);
      }
    });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const getSavingsProgress = () => {
    const { savings } = dashboardData;
    const savingsByAccount = {};
    
    savings.forEach(s => {
      const account = s.account || 'General';
      if (!savingsByAccount[account]) {
        savingsByAccount[account] = { account, current: 0, goal: 0 };
      }
      savingsByAccount[account].current += parseFloat(s.amount || 0);
      savingsByAccount[account].goal += parseFloat(s.goal || 0);
    });

    return Object.values(savingsByAccount).map(s => ({
      ...s,
      progress: s.goal > 0 ? (s.current / s.goal) * 100 : 0
    }));
  };

  const getInvestmentData = () => {
    const { investments } = dashboardData;
    return investments.map(investment => ({
      name: investment.asset_name,
      invested: parseFloat(investment.amount_invested || 0),
      current: parseFloat(investment.current_value || 0),
      type: investment.type
    }));
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{dashboardData.error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const categoryData = getCategoryData();
  const incomeExpenseData = getIncomeExpenseData();
  const savingsProgress = getSavingsProgress();

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Welcome Section */}
      <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-8 text-white shadow-2xl animate-slide-up`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 animate-bounce-in">{theme.welcomeMessage}</h1>
            <p className="text-white/90 text-lg">
              {selectedContext ? `${theme.description} - ${selectedContext.name}` : 'Select a context to get started'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl opacity-20 animate-float">{theme.icon}</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-white text-xl">💰</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Income</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">${totals.totalIncome.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-white text-xl">💸</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Expenses</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">${totals.totalExpenses.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-white text-xl">🔄</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Subscriptions</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">${totals.totalSubscriptions.toFixed(2)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow ${totals.netIncome >= 0 ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gradient-to-br from-red-400 to-red-600'}`}>
                  <span className="text-white text-xl">📈</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Net Income</dt>
                  <dd className={`text-2xl font-bold mt-1 ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${totals.netIncome.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm overflow-hidden shadow-lg rounded-xl hover-lift animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                  <span className="text-white text-xl">💎</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Investments</dt>
                  <dd className="text-2xl font-bold text-gray-900 mt-1">
                    ${totals.totalInvestmentValue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Income vs Expenses */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover-lift animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white text-lg">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Income vs Expenses</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incomeExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover-lift animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white text-lg">🥧</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Spending by Category</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Investment Performance */}
        {getInvestmentData().length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover-lift animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white text-lg">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Investment Performance</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getInvestmentData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value, name) => [`$${value.toFixed(2)}`, name === 'invested' ? 'Invested' : 'Current Value']} />
                <Legend />
                <Bar dataKey="invested" fill="#3B82F6" name="Invested" />
                <Bar dataKey="current" fill="#10B981" name="Current Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Investment Summary */}
      {getInvestmentData().length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white text-lg">💎</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Investment Summary</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-900 mb-2">
                ${totals.totalInvested.toFixed(2)}
              </div>
              <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Invested</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-900 mb-2">
                ${totals.totalInvestmentValue.toFixed(2)}
              </div>
              <div className="text-sm font-semibold text-green-700 uppercase tracking-wide">Current Value</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className={`text-3xl font-bold mb-2 ${totals.investmentProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totals.investmentProfitLoss.toFixed(2)}
              </div>
              <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
                {totals.totalInvested > 0 ? 
                  `${((totals.investmentProfitLoss / totals.totalInvested) * 100).toFixed(1)}% Return` : 
                  'Profit/Loss'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Progress */}
      {savingsProgress.length > 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white text-lg">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Savings Progress</h3>
          </div>
          <div className="space-y-6">
            {savingsProgress.map((saving, index) => (
              <div key={index} className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-gray-800 text-lg">{saving.account}</span>
                  <span className="text-sm font-semibold text-gray-600">
                    ${saving.current.toFixed(2)} / ${saving.goal.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(saving.progress, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-emerald-600">
                    {saving.progress.toFixed(1)}% Complete
                  </span>
                  <span className="text-sm text-gray-500">
                    ${(saving.goal - saving.current).toFixed(2)} remaining
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
