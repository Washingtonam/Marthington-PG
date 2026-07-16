const express = require('express');
const { authenticateAdmin } = require('../middleware/auth');
const {
  getServiceRoutes,
  createServiceRoute,
  updateServiceRoute,
  deleteServiceRoute,
  getWebhookLogs,
  getDashboardSummary
} = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateAdmin);

router.get('/service-routes', getServiceRoutes);
router.post('/service-routes', createServiceRoute);
router.put('/service-routes/:id', updateServiceRoute);
router.delete('/service-routes/:id', deleteServiceRoute);
router.get('/webhook-logs', getWebhookLogs);
router.get('/dashboard-summary', getDashboardSummary);

module.exports = router;
