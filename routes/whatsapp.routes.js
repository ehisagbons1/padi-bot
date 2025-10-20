const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');
const config = require('../config/config');

// Webhook verification (for Meta WhatsApp Cloud API)
router.get('/whatsapp', whatsappController.verifyWebhook);

// Webhook for receiving messages (both Twilio and Meta)
router.post('/whatsapp', whatsappController.handleIncomingMessage);

// Status webhook (for message delivery status)
router.post('/whatsapp/status', whatsappController.handleStatus);

module.exports = router;





