const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    fullname: { type: String },
    email: { type: String },
    phone: { type: String },
    role: { type: Number },
    is_active: { type: Number },
    is_delete: { type: Number },
    created_by: { type: String },
    created_date: { type: Date, default: Date.now },
    updated_by: { type: String },
    updated_date: { type: Date, default: Date.now },
    fk_user_id: { type: String }
});

module.exports = mongoose.model('Admin', AdminSchema, 'admins');
