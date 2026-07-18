const crypto = require('crypto');
const mongoose = require('mongoose');
const { createDynamicConnection, closeDynamicConnection } = require('../config/db');
const ServiceRoute = require('../models/ServiceRoute');
const WebhookLog = require('../models/WebhookLog');

const getServiceIdentifier = (req, payload) => {
  const fromParams = req?.params?.serviceKey;
  if (fromParams) {
    return fromParams;
  }

  const meta = payload?.meta || payload?.metadata || payload?.data?.metadata || {};
  return (
    payload?.serviceKey ||
    payload?.service_id ||
    payload?.data?.serviceKey ||
    payload?.data?.service_id ||
    meta?.serviceKey ||
    meta?.service_id ||
    null
  );
};

const getSignatureFromRequest = (req, route) => {
  const headerName = route?.signatureHeader || 'verif-hash';
  const candidates = [
    req.get(headerName),
    req.get(headerName.toLowerCase()),
    req.header(headerName),
    req.header(headerName.toLowerCase()),
    req.headers?.[headerName],
    req.headers?.[headerName.toLowerCase()]
  ];

  return candidates.find((value) => typeof value === 'string' && value.trim()) || null;
};

const getExpectedSignatures = (payload, secretHash) => {
  const normalizedPayload = typeof payload === 'string' ? payload : JSON.stringify(payload || {});
  const signatures = new Set();

  if (secretHash) {
    signatures.add(crypto.createHmac('sha256', secretHash).update(normalizedPayload).digest('hex'));
    signatures.add(crypto.createHash('sha256').update(normalizedPayload + secretHash).digest('hex'));
  }

  return Array.from(signatures);
};

const verifySignature = async (req, res, next) => {
  const payload = req.body || {};
  const serviceKey = getServiceIdentifier(req, payload);

  if (!serviceKey) {
    return res.status(400).json({ success: false, error: 'Missing service identifier.' });
  }

  try {
    const route = await ServiceRoute.findOne({ serviceKey, status: 'active' });

    if (!route) {
      return res.status(404).json({ success: false, error: 'No matching service route configured.' });
    }

    const signature = getSignatureFromRequest(req, route);
    const secretHash = route.secretHash;

    if (!signature || !secretHash) {
      return res.status(401).json({ success: false, error: 'Missing signature verification information.' });
    }

    const expectedSignatures = getExpectedSignatures(payload, secretHash);

    if (!expectedSignatures.includes(signature.trim())) {
      return res.status(401).json({ success: false, error: 'Invalid signature.' });
    }

    req.routeConfig = route;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getTargetDocumentQuery = (payload, route) => {
  const meta = payload?.meta || payload?.metadata || payload?.data?.metadata || {};
  const queryTerms = [
    { email: payload?.customer?.email },
    { userId: meta?.userId },
    { id: meta?.userId },
    { userId: payload?.userId },
    { id: payload?.userId }
  ].filter((entry) => Object.values(entry).some(Boolean));

  if (queryTerms.length) {
    return { $or: queryTerms };
  }

  if (route?.actionType) {
    return { lastActionType: route.actionType };
  }

  return { _id: { $exists: true } };
};

const buildDynamicUpdate = (actionType, payload, amount, currency) => {
  const normalizedAction = String(actionType || '').trim().toUpperCase();
  const update = {
    $set: {
      lastActionType: actionType,
      lastWebhookReceivedAt: new Date(),
      lastWebhookCurrency: currency,
      lastWebhookAmount: amount
    }
  };

  if (Number(amount) > 0 && /(FUND|WALLET|DEPOSIT|CREDIT)/i.test(normalizedAction)) {
    update.$inc = { balance: Number(amount) || 0 };
  }

  if (/(UPGRADE|PLAN|SUBSCRIPTION|RENEW)/i.test(normalizedAction)) {
    update.$set.plan = 'pro';
    update.$set.role = 'pro';
  }

  if (!update.$inc && !update.$set.plan) {
    update.$set.status = 'processed';
  }

  return update;
};

const routeWebhook = async (req, res) => {
  const payload = req.body || {};
  const transactionId = payload?.id || payload?.transaction_id || payload?.data?.id || `txn-${Date.now()}`;
  const amount = Number(payload?.amount || payload?.data?.amount || 0);
  const currency = payload?.currency || payload?.data?.currency || 'NGN';
  const serviceKey = getServiceIdentifier(req, payload);

  let dynamicConnection = null;

  try {
    const route = req.routeConfig || await ServiceRoute.findOne({ serviceKey, status: 'active' });

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

    dynamicConnection = await createDynamicConnection(route.targetDatabaseURI);
    const targetModel = dynamicConnection.model(route.targetCollection, new mongoose.Schema({}, { strict: false }), route.targetCollection);
    const query = getTargetDocumentQuery(payload, route);
    const safeQuery = Object.keys(query).length > 0 ? query : { _id: { $exists: true } };
    const update = buildDynamicUpdate(route.actionType, payload, amount, currency);

    const result = await targetModel.updateOne(safeQuery, update, { upsert: false });

    await WebhookLog.create({
      transactionId,
      serviceKey,
      amount,
      currency,
      status: 'success',
      payload,
      actionType: route.actionType
    });

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
  } finally {
    if (dynamicConnection) {
      await closeDynamicConnection(dynamicConnection);
    }
  }
};

module.exports = {
  verifySignature,
  routeWebhook
};
