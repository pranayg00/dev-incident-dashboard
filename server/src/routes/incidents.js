const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { analyzeIncident } = require('../services/aiService');

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, s.name as service_name, s.url as service_url
      FROM incidents i
      JOIN services s ON i.service_id = s.id
      ORDER BY i.created_at DESC
      LIMIT 50
    `);
    res.json({ incidents: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single incident
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, s.name as service_name, s.url as service_url
      FROM incidents i
      JOIN services s ON i.service_id = s.id
      WHERE i.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json({ incident: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI analyze incident
router.post('/:id/analyze', async (req, res) => {
  try {
    const incidentResult = await pool.query(`
      SELECT i.*, s.name as service_name
      FROM incidents i JOIN services s ON i.service_id = s.id
      WHERE i.id = $1
    `, [req.params.id]);

    if (incidentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const incident = incidentResult.rows[0];
    const metricsResult = await pool.query(
      `SELECT * FROM metrics WHERE service_id = $1
       ORDER BY checked_at DESC LIMIT 5`,
      [incident.service_id]
    );

    const analysis = await analyzeIncident(incident, metricsResult.rows);

    await pool.query(
      `UPDATE incidents SET
        ai_analysis = $1,
        ai_root_cause = $2,
        ai_fix_suggestion = $3
       WHERE id = $4`,
      [
        analysis.impact,
        analysis.root_cause,
        analysis.fix_suggestion,
        req.params.id,
      ]
    );

    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resolve incident
router.put('/:id/resolve', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE incidents SET status = 'RESOLVED', resolved_at = NOW()
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json({ incident: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;