const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const contextsRoutes = require('./routes/contexts');
const transactionsRoutes = require('./routes/transactions');
const subscriptionsRoutes = require('./routes/subscriptions');
const savingsRoutes = require('./routes/savings');
const budgetsRoutes = require('./routes/budgets');
const investmentsRoutes = require('./routes/investments');

// API Routes
app.use('/api/contexts', contextsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/investments', investmentsRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
