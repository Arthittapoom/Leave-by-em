const mongoose = require('mongoose');

const RunningNumberSchema = new mongoose.Schema({
  type: { type: String },
  year: { type: Number },
  month: { type: Number },
  date: { type: Number },
  number: { type: Number },
  created_by: { type: String },
  created_date: { type: Date, default: Date.now },
  updated_by: { type: String },
  updated_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('RunningNumber', RunningNumberSchema , 'running_number');
