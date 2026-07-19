const test = require('node:test');
const assert = require('node:assert/strict');
const { buildCallbackPayload } = require('../controllers/webhookController');

test('buildCallbackPayload includes the payment context for downstream callbacks', () => {
  const payload = buildCallbackPayload({
    route: { callbackUrl: 'https://wallet.example.com/api/payments/callback' },
    transactionId: 'txn_123',
    serviceKey: 'wallet-service',
    amount: 5000,
    currency: 'NGN',
    status: 'success',
    actionType: 'FUND_WALLET',
    payload: { meta: { userId: 'user_123' } },
    result: { acknowledged: true }
  });

  assert.equal(payload.event, 'payment.webhook.received');
  assert.equal(payload.status, 'success');
  assert.equal(payload.serviceKey, 'wallet-service');
  assert.equal(payload.amount, 5000);
  assert.equal(payload.payload.meta.userId, 'user_123');
});
