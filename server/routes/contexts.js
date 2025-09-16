const express = require('express');
const router = express.Router();
const sheetsService = require('../config/sheets');

const CONTEXTS_HEADERS = ['id', 'name', 'type'];

// GET all contexts
router.get('/', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Contexts');
    const contexts = sheetsService.arrayToObjects(data, CONTEXTS_HEADERS);
    res.json(contexts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contexts' });
  }
});

// GET context by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Contexts');
    const contexts = sheetsService.arrayToObjects(data, CONTEXTS_HEADERS);
    const context = contexts.find(c => c.id === req.params.id);
    
    if (!context) {
      return res.status(404).json({ error: 'Context not found' });
    }
    
    res.json(context);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch context' });
  }
});

// POST new context
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    // Generate new ID
    const data = await sheetsService.readSheet('Contexts');
    const newId = data.length.toString();
    
    const newContext = [newId, name, type];
    await sheetsService.appendRow('Contexts', newContext);
    
    res.status(201).json({ id: newId, name, type });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create context' });
  }
});

// PUT update context
router.put('/:id', async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const data = await sheetsService.readSheet('Contexts');
    const contexts = sheetsService.arrayToObjects(data, CONTEXTS_HEADERS);
    const contextIndex = contexts.findIndex(c => c.id === req.params.id);
    
    if (contextIndex === -1) {
      return res.status(404).json({ error: 'Context not found' });
    }
    
    const updatedContext = [req.params.id, name, type];
    await sheetsService.updateRow('Contexts', contextIndex + 2, updatedContext);
    
    res.json({ id: req.params.id, name, type });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update context' });
  }
});

// DELETE context
router.delete('/:id', async (req, res) => {
  try {
    const data = await sheetsService.readSheet('Contexts');
    const contexts = sheetsService.arrayToObjects(data, CONTEXTS_HEADERS);
    const contextIndex = contexts.findIndex(c => c.id === req.params.id);
    
    if (contextIndex === -1) {
      return res.status(404).json({ error: 'Context not found' });
    }
    
    await sheetsService.deleteRow('Contexts', contextIndex + 2);
    
    res.json({ message: 'Context deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete context' });
  }
});

module.exports = router;
