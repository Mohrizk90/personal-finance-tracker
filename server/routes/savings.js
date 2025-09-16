const express = require('express');
const router = express.Router();
const sheetsService = require('../config/sheets');

const SAVINGS_HEADERS = ['id', 'context_id', 'account', 'date', 'amount', 'goal'];

// GET all savings
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    const data = await sheetsService.readSheet('Savings');
    let savings = sheetsService.arrayToObjects(data, SAVINGS_HEADERS);
    
    if (context_id) {
      savings = savings.filter(s => s.context_id === context_id);
    }
    
    res.json(savings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch savings' });
  }
});

// GET savings by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Savings');
    const savings = sheetsService.arrayToObjects(data, SAVINGS_HEADERS);
    const saving = savings.find(s => s.id === req.params.id);
    
    if (!saving) {
      return res.status(404).json({ error: 'Savings record not found' });
    }
    
    res.json(saving);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch savings record' });
  }
});

// POST new savings record
router.post('/', async (req, res) => {
  try {
    const { context_id, account, date, amount, goal } = req.body;
    
    if (!context_id || !account || !date || !amount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Generate new ID
    const data = await sheetsService.readSheet('Savings');
    const newId = data.length.toString();
    
    const newSavings = [newId, context_id, account, date, amount, goal || ''];
    await sheetsService.appendRow('Savings', newSavings);
    
    res.status(201).json({ id: newId, context_id, account, date, amount, goal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create savings record' });
  }
});

// PUT update savings record
router.put('/:id', async (req, res) => {
  try {
    const { context_id, account, date, amount, goal } = req.body;
    
    if (!context_id || !account || !date || !amount) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const data = await sheetsService.readSheet('Savings');
    const savings = sheetsService.arrayToObjects(data, SAVINGS_HEADERS);
    const savingsIndex = savings.findIndex(s => s.id === req.params.id);
    
    if (savingsIndex === -1) {
      return res.status(404).json({ error: 'Savings record not found' });
    }
    
    const updatedSavings = [req.params.id, context_id, account, date, amount, goal || ''];
    await sheetsService.updateRow('Savings', savingsIndex + 2, updatedSavings);
    
    res.json({ id: req.params.id, context_id, account, date, amount, goal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update savings record' });
  }
});

// DELETE savings record
router.delete('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Savings');
    const savings = sheetsService.arrayToObjects(data, SAVINGS_HEADERS);
    const savingsIndex = savings.findIndex(s => s.id === req.params.id);
    
    if (savingsIndex === -1) {
      return res.status(404).json({ error: 'Savings record not found' });
    }
    
    await sheetsService.deleteRow('Savings', savingsIndex + 2);
    
    res.json({ message: 'Savings record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete savings record' });
  }
});

module.exports = router;
