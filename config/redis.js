const Redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

const setupRedis = async () => {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    redisClient.on('connect', () => logger.info('Connected to Redis'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis setup error:', error);
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    logger.warn('Redis client not initialized');
    return null;
  }
  return redisClient;
};

module.exports = {
  setupRedis,
  getRedisClient
};