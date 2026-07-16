const express = require('express');
const { verifySignature, routeWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/receiver', verifySignature, routeWebhook);

module.exports = router;
