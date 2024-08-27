const mongoose = require('mongoose');

const ConfigLineSchema = new mongoose.Schema({
    token: { type: String, required: true }
});

module.exports = mongoose.model('ConfigLine', ConfigLineSchema, 'configline');
