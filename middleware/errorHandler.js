const logger = require('../utils/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err });
  }

  res.status(500).json({ error: 'Internal server error' });
};