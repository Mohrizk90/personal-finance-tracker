import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContexts } from '../contexts/ContextContext';
import ContextSelector from './ContextSelector';
import { useTheme } from '../hooks/useTheme';

const Layout = ({ children }) => {
  const location = useLocation();
  const { selectedContext } = useContexts();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme(selectedContext?.type || 'Home');

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Transactions', href: '/transactions', icon: '💳' },
    { name: 'Subscriptions', href: '/subscriptions', icon: '🔄' },
    { name: 'Savings', href: '/savings', icon: '💰' },
    { name: 'Budgets', href: '/budgets', icon: '📈' },
    { name: 'Investments', href: '/investments', icon: '💎' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} flex`}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-screen border-r border-gray-200 bg-white/80 backdrop-blur-lg shadow-xl">
            {/* Logo */}
            <div className="flex items-center px-6 py-6 border-b border-gray-200 animate-fade-in">
              <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center mr-3 animate-float shadow-lg`}>
                <span className="text-white text-xl">{theme.icon}</span>
              </div>
              <h1 className="text-xl font-bold gradient-text">Finance Tracker</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg animate-glow`
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:text-gray-900 hover-lift'
                    } group flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 animate-slide-up`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <span className="text-xl">☰</span>
            </button>
            <div className="flex items-center">
              <div className={`w-8 h-8 bg-gradient-to-br ${theme.gradient} rounded-lg flex items-center justify-center mr-2`}>
                <span className="text-white text-sm">{theme.icon}</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900">Finance Tracker</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page header */}
        <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between animate-fade-in">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold gradient-text">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h2>
                {selectedContext && (
                  <div className="flex items-center mt-2 animate-slide-up">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse-slow"></div>
                    <p className="text-sm text-gray-600">
                      Managing: <span className="font-semibold text-gray-900">{selectedContext.name}</span> 
                      <span className={`ml-2 px-3 py-1 bg-gradient-to-r ${theme.primary[100]} ${theme.primary[200]} text-${theme.primary[800]} text-xs font-medium rounded-full shadow-sm`}>
                        {selectedContext.type}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <ContextSelector />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <span className="text-white text-xl">×</span>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white text-xl">💰</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Finance Tracker</h1>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 hover:text-gray-900'
                    } group flex items-center px-4 py-3 text-base font-semibold rounded-xl transition-all duration-200`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
