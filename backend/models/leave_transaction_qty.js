const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaveTransactionQtySchema = new mongoose.Schema({
  day: { type: Number },
  fk_leave_type_id: { type: Number },
  fk_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hour: { type: Number },
  year: { type: Number }
});
module.exports = mongoose.model('LeaveTransactionQty', LeaveTransactionQtySchema,'leave_transaction_qty');