const axios = require('axios');
const pool = require('../config/db');
const redis = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

const checkService = async (service) => {
  const start = Date.now();
  try {
    const response = await axios.get(service.url, { timeout: 10000 });
    const responseTime = Date.now() - start;
    const status = responseTime > 3000 ? 'DEGRADED' : 'UP';

    await pool.query(
      `INSERT INTO metrics (service_id, status, response_time, status_code, checked_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [service.id, status, responseTime, response.status]
    );

    await redis.setex(
      `service:${service.id}:status`,
      60,
      JSON.stringify({ status, responseTime, checkedAt: new Date() })
    );

    return { serviceId: service.id, status, responseTime };
  } catch (error) {
    const responseTime = Date.now() - start;
    const errorMessage = error.message;

    await pool.query(
      `INSERT INTO metrics (service_id, status, response_time, status_code, error_message, checked_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [service.id, 'DOWN', responseTime, error.response?.status || 0, errorMessage]
    );

    await redis.setex(
      `service:${service.id}:status`,
      60,
      JSON.stringify({ status: 'DOWN', responseTime, error: errorMessage, checkedAt: new Date() })
    );

    await createIncident(service, errorMessage);
    return { serviceId: service.id, status: 'DOWN', error: errorMessage };
  }
};

const createIncident = async (service, errorMessage) => {
  const existing = await pool.query(
    `SELECT id FROM incidents 
     WHERE service_id = $1 AND status != 'RESOLVED'
     ORDER BY created_at DESC LIMIT 1`,
    [service.id]
  );

  if (existing.rows.length > 0) return;

  const severity = errorMessage.includes('timeout') ? 'HIGH' : 'CRITICAL';

  await pool.query(
    `INSERT INTO incidents (service_id, title, description, severity, status)
     VALUES ($1, $2, $3, $4, 'OPEN')`,
    [
      service.id,
      `${service.name} is DOWN`,
      `Service at ${service.url} failed: ${errorMessage}`,
      severity,
    ]
  );

  console.log(`🚨 Incident created for ${service.name}`);
};

const checkAllServices = async () => {
  try {
    const result = await pool.query('SELECT * FROM services');
    const services = result.rows;
    await Promise.allSettled(services.map(checkService));
  } catch (err) {
    console.error('Monitor error:', err.message);
  }
};

const triggerDemoIncident = async (serviceId) => {
  const result = await pool.query('SELECT * FROM services WHERE id = $1', [serviceId]);
  const service = result.rows[0];
  if (!service) throw new Error('Service not found');

  await pool.query(
    `INSERT INTO metrics (service_id, status, response_time, status_code, error_message, checked_at)
     VALUES ($1, 'DOWN', $2, 503, 'Service Unavailable - Demo incident triggered', NOW())`,
    [serviceId, Math.floor(Math.random() * 5000) + 1000]
  );

  const incidentResult = await pool.query(
    `INSERT INTO incidents (service_id, title, description, severity, status)
     VALUES ($1, $2, $3, 'HIGH', 'OPEN') RETURNING *`,
    [
      serviceId,
      `${service.name} - Demo Incident`,
      `Simulated failure for ${service.name}: Connection timeout after 30s. Multiple retries failed.`,
    ]
  );

  return incidentResult.rows[0];
};

module.exports = { checkAllServices, checkService, triggerDemoIncident };