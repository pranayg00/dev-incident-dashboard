const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 100, 3000);
  },
});

redis.on('connect', () => console.log('Connected to Redis'));
redis.on('error', (err) => console.log('Redis not available, continuing without cache'));

module.exports = redis;