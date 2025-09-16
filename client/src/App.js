import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ContextProvider } from './contexts/ContextContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Subscriptions from './pages/Subscriptions';
import Savings from './pages/Savings';
import Budgets from './pages/Budgets';
import Investments from './pages/Investments';

function App() {
  return (
    <ContextProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/savings" element={<Savings />} />
              <Route path="/budgets" element={<Budgets />} />
              <Route path="/investments" element={<Investments />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </ContextProvider>
  );
}

export default App;
