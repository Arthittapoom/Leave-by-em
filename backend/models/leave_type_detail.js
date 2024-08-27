const mongoose = require('mongoose');

const LeaveTypeDetailSchema = new mongoose.Schema({
  FK_LEAVE_TYPE_ID: { type: String, ref: 'leave_type' },
  QTY: { type: Number, required: true },
  YEAR: { type: Number, required: true },
  FK_EMPLOYEE_TYPE_ID: { type: String, ref: 'employee_type' }
}, { timestamps: true });

module.exports = mongoose.model('LeaveTypeDetail', LeaveTypeDetailSchema, 'leave_type_detail');
