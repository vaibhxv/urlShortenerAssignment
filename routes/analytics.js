const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

/**
 * @swagger
 * /api/analytics/overall:
 *   get:
 *     summary: Get overall analytics for the user
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Overall analytics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analytics'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/overall', isAuthenticated, analyticsController.getOverallAnalytics);

/**
 * @swagger
 * /api/analytics/topic/{topic}:
 *   get:
 *     summary: Get analytics for a specific topic
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: topic
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic name
 *     responses:
 *       200:
 *         description: Topic analytics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analytics'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/topic/:topic', isAuthenticated, analyticsController.getTopicAnalytics);

/**
 * @swagger
 * /api/analytics/{alias}:
 *   get:
 *     summary: Get analytics for a specific URL
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alias
 *         required: true
 *         schema:
 *           type: string
 *         description: URL alias
 *     responses:
 *       200:
 *         description: URL analytics data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Analytics'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: URL not found
 *       500:
 *         description: Server error
 */
router.get('/:alias', isAuthenticated, analyticsController.getUrlAnalytics);

module.exports = router;