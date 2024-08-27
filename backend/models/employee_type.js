const mongoose = require('mongoose');

const EmployeeTypeSchema = new mongoose.Schema({
  employee_type_name: { type: String }
});

module.exports = mongoose.model('EmployeeType', EmployeeTypeSchema, 'employee_type');
