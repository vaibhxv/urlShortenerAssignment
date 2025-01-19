const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const urlRoutes = require('./url');
const analyticsRoutes = require('./analytics');

router.use('/auth', authRoutes);
router.use('/shorten', urlRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;