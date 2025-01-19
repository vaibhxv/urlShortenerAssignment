const Url = require('../models/url');
const { getRedisClient } = require('../config/redis');
const logger = require('../utils/logger');

exports.getUrlAnalytics = async (req, res) => {
  try {
    const { alias } = req.params;
    const redis = getRedisClient();
    
    let analytics;
    
    // Only try cache if Redis is available
    if (redis) {
      const cacheKey = `analytics:${alias}`;
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }
    }

    const url = await Url.findOne({ alias });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Calculate analytics
    analytics = {
      totalClicks: url.clicks,
      uniqueUsers: new Set(url.analytics.map(a => a.ipAddress)).size,
      clicksByDate: calculateClicksByDate(url.analytics),
      osType: calculateOsStats(url.analytics),
      deviceType: calculateDeviceStats(url.analytics)
    };

    // Cache only if Redis is available
    if (redis) {
      try {
        await redis.set(`analytics:${alias}`, JSON.stringify(analytics), 'EX', 300);
      } catch (cacheError) {
        logger.error('Redis caching error:', cacheError);
      }
    }

    res.json(analytics);
  } catch (error) {
    logger.error('Error getting URL analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;
    const urls = await Url.find({ topic, userId: req.user.id });

    const analytics = {
      totalClicks: urls.reduce((sum, url) => sum + url.clicks, 0),
      uniqueUsers: new Set(urls.flatMap(url => 
        url.analytics.map(a => a.ipAddress)
      )).size,
      clicksByDate: calculateClicksByDate(
        urls.flatMap(url => url.analytics)
      ),
      urls: urls.map(url => ({
        shortUrl: url.shortUrl,
        totalClicks: url.clicks,
        uniqueUsers: new Set(url.analytics.map(a => a.ipAddress)).size
      }))
    };

    res.json(analytics);
  } catch (error) {
    logger.error('Error getting topic analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getOverallAnalytics = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.id });
    const allAnalytics = urls.flatMap(url => url.analytics);

    const analytics = {
      totalUrls: urls.length,
      totalClicks: urls.reduce((sum, url) => sum + url.clicks, 0),
      uniqueUsers: new Set(allAnalytics.map(a => a.ipAddress)).size,
      clicksByDate: calculateClicksByDate(allAnalytics),
      osType: calculateOsStats(allAnalytics),
      deviceType: calculateDeviceStats(allAnalytics)
    };

    res.json(analytics);
  } catch (error) {
    logger.error('Error getting overall analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper functions
function calculateClicksByDate(analytics) {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const clicksByDate = {};
  analytics
    .filter(a => new Date(a.timestamp) >= last7Days)
    .forEach(a => {
      const date = new Date(a.timestamp).toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });

  return Object.entries(clicksByDate).map(([date, clicks]) => ({
    date,
    clicks
  }));
}

function calculateOsStats(analytics) {
  const stats = {};
  analytics.forEach(a => {
    if (!stats[a.osType]) {
      stats[a.osType] = {
        uniqueClicks: 0,
        uniqueUsers: new Set()
      };
    }
    stats[a.osType].uniqueClicks++;
    stats[a.osType].uniqueUsers.add(a.ipAddress);
  });

  return Object.entries(stats).map(([osName, data]) => ({
    osName,
    uniqueClicks: data.uniqueClicks,
    uniqueUsers: data.uniqueUsers.size
  }));
}

function calculateDeviceStats(analytics) {
  const stats = {};
  analytics.forEach(a => {
    if (!stats[a.deviceType]) {
      stats[a.deviceType] = {
        uniqueClicks: 0,
        uniqueUsers: new Set()
      };
    }
    stats[a.deviceType].uniqueClicks++;
    stats[a.deviceType].uniqueUsers.add(a.ipAddress);
  });

  return Object.entries(stats).map(([deviceName, data]) => ({
    deviceName,
    uniqueClicks: data.uniqueClicks,
    uniqueUsers: data.uniqueUsers.size
  }));
}