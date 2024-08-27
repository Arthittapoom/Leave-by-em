const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaveTypeSchema = new Schema({
  leave_name: { type: String },
  created_by: { type: String }, 
  created_date: { type: Date, default: Date.now },
  updated_by: { type: String },
  updated_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LeaveType', LeaveTypeSchema, 'leave_type');