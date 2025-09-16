const express = require('express');
const router = express.Router();
const sheetsService = require('../config/sheets');

const SUBSCRIPTIONS_HEADERS = ['id', 'context_id', 'service', 'amount', 'frequency', 'next_billing_date', 'status'];

// GET all subscriptions
router.get('/', async (req, res) => {
  try {
    const { context_id } = req.query;
    const data = await sheetsService.readSheet('Subscriptions');
    let subscriptions = sheetsService.arrayToObjects(data, SUBSCRIPTIONS_HEADERS);
    
    if (context_id) {
      subscriptions = subscriptions.filter(s => s.context_id === context_id);
    }
    
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// GET subscription by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Subscriptions');
    const subscriptions = sheetsService.arrayToObjects(data, SUBSCRIPTIONS_HEADERS);
    const subscription = subscriptions.find(s => s.id === req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST new subscription
router.post('/', async (req, res) => {
  try {
    const { context_id, service, amount, frequency, next_billing_date, status } = req.body;
    
    if (!context_id || !service || !amount || !frequency) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Generate new ID
    const data = await sheetsService.readSheet('Subscriptions');
    const newId = data.length.toString();
    
    const newSubscription = [newId, context_id, service, amount, frequency, next_billing_date || '', status || 'Active'];
    await sheetsService.appendRow('Subscriptions', newSubscription);
    
    res.status(201).json({ id: newId, context_id, service, amount, frequency, next_billing_date, status: status || 'Active' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// PUT update subscription
router.put('/:id', async (req, res) => {
  try {
    const { context_id, service, amount, frequency, next_billing_date, status } = req.body;
    
    if (!context_id || !service || !amount || !frequency) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const data = await sheetsService.readSheet('Subscriptions');
    const subscriptions = sheetsService.arrayToObjects(data, SUBSCRIPTIONS_HEADERS);
    const subscriptionIndex = subscriptions.findIndex(s => s.id === req.params.id);
    
    if (subscriptionIndex === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    const updatedSubscription = [req.params.id, context_id, service, amount, frequency, next_billing_date || '', status || 'Active'];
    await sheetsService.updateRow('Subscriptions', subscriptionIndex + 2, updatedSubscription);
    
    res.json({ id: req.params.id, context_id, service, amount, frequency, next_billing_date, status: status || 'Active' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// DELETE subscription
router.delete('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Subscriptions');
    const subscriptions = sheetsService.arrayToObjects(data, SUBSCRIPTIONS_HEADERS);
    const subscriptionIndex = subscriptions.findIndex(s => s.id === req.params.id);
    
    if (subscriptionIndex === -1) {
      return res.status(404).json({ error: 'Subscription not found' });
    }
    
    await sheetsService.deleteRow('Subscriptions', subscriptionIndex + 2);
    
    res.json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
});

module.exports = router;
