const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaveTransactionSchema = new Schema({
  fk_user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },  // สมมติว่า fk_user_id อ้างอิงไปยัง User
  leave_type: { type: String, ref: "LeaveType" }, // อ้างอิงไปยังโมเดล LeaveType
  leave_to_date: { type: Date },
  time_start: { type: String },
  leave_end_date: { type: Date },
  time_end: { type: String },
  file_url: { type: String },
  status: { type: Number },
  primary_approve: { type: String },
  primary_approve_description: { type: String },
  primary_approved_date: { type: Date },
  sub_approve: { type: String },
  sub_approve_description: { type: String },
  sub_approved_date: { type: String },
  created_by: { type: String, ref: "users" },
  created_date: { type: Date, default: Date.now },
  updated_by: { type: String },
  updated_date: { type: Date, default: Date.now },
  leave_reason: { type: String },
  is_retire: { type: String },
  is_work_outside: { type: String },
  change_work_location: { type: String },
  car: { type: String },
  license_plate: { type: String },
  is_active: { type: Number },
  fund_type: { type: String },
  fund_number: { type: String },
  flag_certificate: { type: String },
  other_work_location: { type: String },
  leave_code: { type: String },
});

module.exports = mongoose.model('LeaveTransaction', LeaveTransactionSchema, 'leave_transaction');
