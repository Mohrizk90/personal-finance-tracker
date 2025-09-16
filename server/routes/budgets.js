const express = require('express');
const router = express.Router();
const sheetsService = require('../config/sheets');

const BUDGETS_HEADERS = ['id', 'context_id', 'category', 'monthly_limit', 'month', 'spent'];

// GET all budgets
router.get('/', async (req, res) => {
  try {
    const { context_id, month } = req.query;
    const data = await sheetsService.readSheet('Budgets');
    let budgets = sheetsService.arrayToObjects(data, BUDGETS_HEADERS);
    
    if (context_id) {
      budgets = budgets.filter(b => b.context_id === context_id);
    }
    
    if (month) {
      budgets = budgets.filter(b => b.month === month);
    }
    
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// GET budget by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Budgets');
    const budgets = sheetsService.arrayToObjects(data, BUDGETS_HEADERS);
    const budget = budgets.find(b => b.id === req.params.id);
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// POST new budget
router.post('/', async (req, res) => {
  try {
    const { context_id, category, monthly_limit, month, spent } = req.body;
    
    if (!context_id || !category || !monthly_limit || !month) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Generate new ID
    const data = await sheetsService.readSheet('Budgets');
    const newId = data.length.toString();
    
    const newBudget = [newId, context_id, category, monthly_limit, month, spent || '0'];
    await sheetsService.appendRow('Budgets', newBudget);
    
    res.status(201).json({ id: newId, context_id, category, monthly_limit, month, spent: spent || '0' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// PUT update budget
router.put('/:id', async (req, res) => {
  try {
    const { context_id, category, monthly_limit, month, spent } = req.body;
    
    if (!context_id || !category || !monthly_limit || !month) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const data = await sheetsService.readSheet('Budgets');
    const budgets = sheetsService.arrayToObjects(data, BUDGETS_HEADERS);
    const budgetIndex = budgets.findIndex(b => b.id === req.params.id);
    
    if (budgetIndex === -1) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    const updatedBudget = [req.params.id, context_id, category, monthly_limit, month, spent || '0'];
    await sheetsService.updateRow('Budgets', budgetIndex + 2, updatedBudget);
    
    res.json({ id: req.params.id, context_id, category, monthly_limit, month, spent: spent || '0' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// DELETE budget
router.delete('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Budgets');
    const budgets = sheetsService.arrayToObjects(data, BUDGETS_HEADERS);
    const budgetIndex = budgets.findIndex(b => b.id === req.params.id);
    
    if (budgetIndex === -1) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    await sheetsService.deleteRow('Budgets', budgetIndex + 2);
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
