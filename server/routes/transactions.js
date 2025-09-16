const express = require('express');
const router = express.Router();
const sheetsService = require('../config/sheets');

const TRANSACTIONS_HEADERS = ['id', 'context_id', 'date', 'category', 'type', 'amount', 'account', 'notes'];

// GET all transactions
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    const data = await sheetsService.readSheet('Transactions');
    let transactions = sheetsService.arrayToObjects(data, TRANSACTIONS_HEADERS);
    
    if (context_id) {
      transactions = transactions.filter(t => t.context_id === context_id);
    }
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Transactions');
    const transactions = sheetsService.arrayToObjects(data, TRANSACTIONS_HEADERS);
    const transaction = transactions.find(t => t.id === req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// POST new transaction
router.post('/', async (req, res) => {
  try {
    const { context_id, date, category, type, amount, account, notes } = req.body;
    
    if (!context_id || !date || !category || !type || !amount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Generate new ID
    const data = await sheetsService.readSheet('Transactions');
    const newId = data.length.toString();
    
    const newTransaction = [newId, context_id, date, category, type, amount, account || '', notes || ''];
    await sheetsService.appendRow('Transactions', newTransaction);
    
    res.status(201).json({ id: newId, context_id, date, category, type, amount, account, notes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
  try {
    const { context_id, date, category, type, amount, account, notes } = req.body;
    
    if (!context_id || !date || !category || !type || !amount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const data = await sheetsService.readSheet('Transactions');
    const transactions = sheetsService.arrayToObjects(data, TRANSACTIONS_HEADERS);
    const transactionIndex = transactions.findIndex(t => t.id === req.params.id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    const updatedTransaction = [req.params.id, context_id, date, category, type, amount, account || '', notes || ''];
    await sheetsService.updateRow('Transactions', transactionIndex + 2, updatedTransaction);
    
    res.json({ id: req.params.id, context_id, date, category, type, amount, account, notes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Transactions');
    const transactions = sheetsService.arrayToObjects(data, TRANSACTIONS_HEADERS);
    const transactionIndex = transactions.findIndex(t => t.id === req.params.id);
    
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await sheetsService.deleteRow('Transactions', transactionIndex + 2);
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
