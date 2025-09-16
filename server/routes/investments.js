const express = require('express');
const router = express.Router();
const sheetsService = require('../config/sheets');

const INVESTMENTS_HEADERS = ['id', 'context_id', 'asset_name', 'type', 'amount_invested', 'current_value', 'date_invested', 'notes'];

// GET all investments
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    const data = await sheetsService.readSheet('Investments');
    let investments = sheetsService.arrayToObjects(data, INVESTMENTS_HEADERS);
    
    if (context_id) {
      investments = investments.filter(i => i.context_id === context_id);
    }
    
    res.json(investments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// GET investment by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Investments');
    const investments = sheetsService.arrayToObjects(data, INVESTMENTS_HEADERS);
    const investment = investments.find(i => i.id === req.params.id);
    
    if (!investment) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    res.json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch investment' });
  }
});

// POST new investment
router.post('/', async (req, res) => {
  try {
    const { context_id, asset_name, type, amount_invested, current_value, date_invested, notes } = req.body;
    
    if (!context_id || !asset_name || !type || !amount_invested || !date_invested) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(amount_invested)) || parseFloat(amount_invested) <= 0) {
      return res.status(400).json({ error: 'Amount invested must be a positive number' });
    }

    if (current_value && (isNaN(parseFloat(current_value)) || parseFloat(current_value) < 0)) {
      return res.status(400).json({ error: 'Current value must be a non-negative number' });
    }

    // Generate new ID
    const data = await sheetsService.readSheet('Investments');
    const newId = data.length.toString();
    
    const newInvestment = [
      newId, 
      context_id, 
      asset_name, 
      type, 
      amount_invested, 
      current_value || amount_invested, // Default current value to amount invested if not provided
      date_invested, 
      notes || ''
    ];
    
    await sheetsService.appendRow('Investments', newInvestment);
    
    res.status(201).json({ 
      id: newId, 
      context_id, 
      asset_name, 
      type, 
      amount_invested, 
      current_value: current_value || amount_invested, 
      date_invested, 
      notes: notes || '' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// PUT update investment
router.put('/:id', async (req, res) => {
  try {
    const { context_id, asset_name, type, amount_invested, current_value, date_invested, notes } = req.body;
    
    if (!context_id || !asset_name || !type || !amount_invested || !date_invested) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(amount_invested)) || parseFloat(amount_invested) <= 0) {
      return res.status(400).json({ error: 'Amount invested must be a positive number' });
    }

    if (current_value && (isNaN(parseFloat(current_value)) || parseFloat(current_value) < 0)) {
      return res.status(400).json({ error: 'Current value must be a non-negative number' });
    }

    const data = await sheetsService.readSheet('Investments');
    const investments = sheetsService.arrayToObjects(data, INVESTMENTS_HEADERS);
    const investmentIndex = investments.findIndex(i => i.id === req.params.id);
    
    if (investmentIndex === -1) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    const updatedInvestment = [
      req.params.id, 
      context_id, 
      asset_name, 
      type, 
      amount_invested, 
      current_value || amount_invested, 
      date_invested, 
      notes || ''
    ];
    
    await sheetsService.updateRow('Investments', investmentIndex + 2, updatedInvestment);
    
    res.json({ 
      id: req.params.id, 
      context_id, 
      asset_name, 
      type, 
      amount_invested, 
      current_value: current_value || amount_invested, 
      date_invested, 
      notes: notes || '' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update investment' });
  }
});

// DELETE investment
router.delete('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Investments');
    const investments = sheetsService.arrayToObjects(data, INVESTMENTS_HEADERS);
    const investmentIndex = investments.findIndex(i => i.id === req.params.id);
    
    if (investmentIndex === -1) {
      return res.status(404).json({ error: 'Investment not found' });
    }
    
    await sheetsService.deleteRow('Investments', investmentIndex + 2);
    
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete investment' });
  }
});

module.exports = router;
