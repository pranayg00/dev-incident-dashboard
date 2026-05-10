const express = require('express');
const router = express.Router();
const { analyzeIncident } = require('../services/aiService');

router.post('/analyze', async (req, res) => {
  try {
    const { incident, metrics } = req.body;
    const analysis = await analyzeIncident(incident, metrics || []);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;