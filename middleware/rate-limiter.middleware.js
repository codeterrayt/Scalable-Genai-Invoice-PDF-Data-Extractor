const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  standardHeaders: false, 
  legacyHeaders: false, 

  store: new RedisStore({
    sendCommand: (command, ...args) => redisClient.call(command, ...args),
  }),
});

module.exports = { rateLimiter };
