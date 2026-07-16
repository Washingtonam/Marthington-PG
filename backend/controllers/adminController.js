const ServiceRoute = require('../models/ServiceRoute');
const WebhookLog = require('../models/WebhookLog');

const getServiceRoutes = async (req, res) => {
  try {
    const routes = await ServiceRoute.find().sort({ createdAt: -1 });
    res.json({ success: true, data: routes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createServiceRoute = async (req, res) => {
  try {
    const { serviceName, serviceKey, targetDatabaseURI, targetCollection, actionType, status } = req.body;

    const route = await ServiceRoute.create({
      serviceName,
      serviceKey,
      targetDatabaseURI,
      targetCollection,
      actionType,
      status
    });

    res.status(201).json({ success: true, data: route });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const updateServiceRoute = async (req, res) => {
  try {
    const updated = await ServiceRoute.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Service route not found.' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const deleteServiceRoute = async (req, res) => {
  try {
    const deleted = await ServiceRoute.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Service route not found.' });
    }

    res.json({ success: true, message: 'Service route removed.' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

const getWebhookLogs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      WebhookLog.find().sort({ timestamp: -1 }).skip(skip).limit(limit),
      WebhookLog.countDocuments()
    ]);

    res.json({ success: true, data: logs, pagination: { page, limit, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const [totalTransactions, activeIntegrations, successCount] = await Promise.all([
      WebhookLog.countDocuments(),
      ServiceRoute.countDocuments({ status: 'active' }),
      WebhookLog.countDocuments({ status: 'success' })
    ]);

    const successRate = totalTransactions ? Math.round((successCount / totalTransactions) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalTransactions,
        activeIntegrations,
        successRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getServiceRoutes,
  createServiceRoute,
  updateServiceRoute,
  deleteServiceRoute,
  getWebhookLogs,
  getDashboardSummary
};
