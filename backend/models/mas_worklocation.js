const mongoose = require('mongoose');

const MasWorklocationSchema = new mongoose.Schema({
  name: { type: String }
});

module.exports = mongoose.model('MasWorklocation', MasWorklocationSchema, 'mas_worklocation');