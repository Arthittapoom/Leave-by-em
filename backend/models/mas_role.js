const mongoose = require('mongoose');

const MasRoleSchema = new mongoose.Schema({
  name: { type: String }
});

module.exports = mongoose.model('MasRole', MasRoleSchema, 'mas_role');