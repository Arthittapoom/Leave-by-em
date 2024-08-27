const mongoose = require('mongoose');

const WebhookLineSchema = new mongoose.Schema({
  jsondate: { type: String }
});

module.exports = mongoose.model('WebhookLine', WebhookLineSchema , 'webhook_line');
