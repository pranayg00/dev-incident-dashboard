const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const redis = require('../config/redis');
const { triggerDemoIncident } = require('../services/monitorService');

// Get all services with current status
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY created_at DESC');
    const services = await Promise.all(
      result.rows.map(async (service) => {
        try {
          const cached = await redis.get(`service:${service.id}:status`);
          const status = cached ? JSON.parse(cached) : { status: 'UNKNOWN' };
          return { ...service, currentStatus: status };
        } catch {
          return { ...service, currentStatus: { status: 'UNKNOWN' } };
        }
      })
    );
    res.json({ services });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new service
router.post('/', async (req, res) => {
  const { name, url, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO services (name, url, description) VALUES ($1, $2, $3) RETURNING *',
      [name, url, description]
    );
    res.status(201).json({ service: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM services WHERE id = $1', [req.params.id]);
    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Trigger demo incident
router.post('/:id/trigger-incident', async (req, res) => {
  try {
    const incident = await triggerDemoIncident(req.params.id);
    res.json({ incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;