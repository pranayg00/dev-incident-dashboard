const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/services', require('./routes/services'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Start monitoring cron job
const monitor = require('./services/monitorService');
cron.schedule('*/30 * * * * *', () => {
  monitor.checkAllServices();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;