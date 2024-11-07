const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    createdAt: { type: Date, required: true },
    isActive: { type: Boolean, required: true }
});

module.exports = mongoose.model('Admin', AdminSchema, 'admindb');