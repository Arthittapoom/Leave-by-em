const mongoose = require('mongoose');

const PeriodTimeSchema = new mongoose.Schema({
  time: { type: Number }
});

module.exports = mongoose.model('PeriodTime', PeriodTimeSchema, 'period_time');