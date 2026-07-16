const crypto = require('crypto');
const mongoose = require('mongoose');
const { FLUTTERWAVE_SECRET_HASH } = require('../config/keys');
const { createDynamicConnection, closeDynamicConnection } = require('../config/db');
const ServiceRoute = require('../models/ServiceRoute');
const WebhookLog = require('../models/WebhookLog');

const verifyFlutterwaveSignature = (req, res, next) => {
  const signature = req.header('verif-hash');
  const payload = JSON.stringify(req.body);

  if (!signature || !FLUTTERWAVE_SECRET_HASH) {
    return res.status(401).json({ success: false, error: 'Missing signature verification information.' });
  }

  const expectedHash = crypto
    .createHash('sha256')
    .update(payload + FLUTTERWAVE_SECRET_HASH)
    .digest('hex');

  if (expectedHash !== signature) {
    return res.status(401).json({ success: false, error: 'Invalid signature.' });
  }

  next();
};

const verifySignature = (req, res, next) => {
  verifyFlutterwaveSignature(req, res, next);
};

const getServiceKeyFromPayload = (payload) => {
  const meta = payload?.meta || payload?.metadata || {};
  return meta?.serviceKey || payload?.serviceKey || null;
};

const getTargetDocumentQuery = (payload, route) => {
  const meta = payload?.meta || payload?.metadata || {};
  if (route.actionType === 'FUND_WALLET') {
    return {
      $or: [
        { email: payload?.customer?.email },
        { userId: meta?.userId },
        { id: meta?.userId }
      ].filter(Boolean)
    };
  }

  if (route.actionType === 'UPGRADE_PLAN') {
    return {
      $or: [
        { email: payload?.customer?.email },
        { userId: meta?.userId },
        { id: meta?.userId }
      ].filter(Boolean)
    };
  }

  return {};
};

const routeWebhook = async (req, res) => {
  const payload = req.body || {};
  const transactionId = payload?.id || payload?.transaction_id || payload?.data?.id || `txn-${Date.now()}`;
  const amount = Number(payload?.amount || payload?.data?.amount || 0);
  const currency = payload?.currency || payload?.data?.currency || 'NGN';
  const serviceKey = getServiceKeyFromPayload(payload);

  try {
    const route = await ServiceRoute.findOne({ serviceKey, status: 'active' });

    if (!route) {
      await WebhookLog.create({
        transactionId,
        serviceKey,
        amount,
        currency,
        status: 'failed',
        payload,
        errorMessage: 'No matching service route found.'
      });

      return res.status(200).json({ success: true, message: 'Webhook acknowledged. No route configured.' });
    }

    const dynamicConnection = await createDynamicConnection(route.targetDatabaseURI);
    const targetModel = dynamicConnection.model(route.targetCollection, new mongoose.Schema({}, { strict: false }), route.targetCollection);
    const query = getTargetDocumentQuery(payload, route);

    let result;

    if (route.actionType === 'FUND_WALLET') {
      result = await targetModel.updateOne(query, { $inc: { balance: amount } }, { upsert: false });
    } else if (route.actionType === 'UPGRADE_PLAN') {
      result = await targetModel.updateOne(query, { $set: { plan: 'pro', role: 'pro' } }, { upsert: false });
    }

    await WebhookLog.create({
      transactionId,
      serviceKey,
      amount,
      currency,
      status: 'success',
      payload
    });

    await closeDynamicConnection(dynamicConnection);
    return res.status(200).json({ success: true, message: 'Webhook routed successfully.', result });
  } catch (error) {
    await WebhookLog.create({
      transactionId,
      serviceKey,
      amount,
      currency,
      status: 'failed',
      payload,
      errorMessage: error.message
    });

    return res.status(200).json({ success: true, message: 'Webhook received but failed to route.', error: error.message });
  }
};

module.exports = {
  verifySignature,
  routeWebhook
};
