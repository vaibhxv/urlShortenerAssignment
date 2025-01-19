const Url = require('../models/url');
const { getRedisClient } = require('../config/redis');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const logger = require('../utils/logger');
const crypto = require('crypto');

function generateAlias(length = 8) {
  const bytes = crypto.randomBytes(Math.ceil(length * 3 / 4));
  return bytes.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .slice(0, length);
}

exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.user.id;
    const redis = getRedisClient();

    const alias = customAlias || generateAlias();

    const existingUrl = await Url.findOne({ alias });
    if (existingUrl) {
      return res.status(400).json({ error: 'Alias already in use' });
    }

    const shortUrl = `${process.env.BASE_URL}/${alias}`;
    
    const url = await Url.create({
      userId,
      longUrl,
      shortUrl,
      alias,
      topic
    });

    if (redis) {
      try {
        await redis.set(`url:${alias}`, longUrl, 'EX', 86400); 
      } catch (cacheError) {
        logger.error('Redis caching error:', cacheError);
      }
    }

    res.status(201).json({
      shortUrl,
      createdAt: url.createdAt
    });
  } catch (error) {
    logger.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.redirectToLongUrl = async (req, res) => {
  try {
    const { alias } = req.params;
    const redis = getRedisClient();
    let longUrl;

    if (redis) {
      try {
        longUrl = await redis.get(`url:${alias}`);
      } catch (cacheError) {
        logger.error('Redis get error:', cacheError);
      }
    }

    if (!longUrl) {
      const url = await Url.findOne({ alias });
      if (!url) {
        return res.status(404).json({ error: 'URL not found' });
      }
      longUrl = url.longUrl;

      if (redis) {
        try {
          await redis.set(`url:${alias}`, longUrl, 'EX', 86400);
        } catch (cacheError) {
          logger.error('Redis set error:', cacheError);
        }
      }
    }

    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    const ip = req.ip;
    const geo = geoip.lookup(ip);

    await Url.findOneAndUpdate(
      { alias },
      {
        $inc: { clicks: 1 },
        $push: {
          analytics: {
            timestamp: new Date(),
            userAgent: req.headers['user-agent'],
            ipAddress: ip,
            location: geo,
            osType: ua.os.name,
            deviceType: ua.device.type || 'desktop'
          }
        }
      }
    );

    res.redirect(longUrl);
  } catch (error) {
    logger.error('Error redirecting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};