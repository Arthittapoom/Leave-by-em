const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    line_userid: { type: String },
    emp_code: { type: Number },
    affiliation: { type: String },
    affiliation_sub: { type: String },
    fullname: { type: String },
    phone: { type: String },
    position: { type: String },
    department: { type: String },
    faction: { type: String },
    work_location: { type: String },
    start_work: { type: Date },
    project: { type: String },
    advanced_leave_approver: { type: String },
    is_verify: { type: Number },
    is_active: { type: Number },
    created_by: { type: Number },
    created_date: { type: Date, default: Date.now },
    updated_by: { type: String },
    updated_date: { type: Date, default: Date.now },
    is_retire: { type: String },
    last_work: { type: String },
    email: { type: String },
    fk_employee_type_id: { type: String },
    title: { type: String },
});

UserSchema.index({ username: 'text', fullname: 'text', email: 'text' });
module.exports = mongoose.model('User', UserSchema, 'users');
