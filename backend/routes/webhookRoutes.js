const express = require('express');
const { verifySignature, routeWebhook } = require('../controllers/webhookController');

const router = express.Router();

router.post('/receiver/:serviceKey?', verifySignature, routeWebhook);
router.post('/:serviceKey?', verifySignature, routeWebhook);

module.exports = router;
