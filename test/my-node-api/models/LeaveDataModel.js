const mongoose = require('mongoose');

const LeaveDataSchema = new mongoose.Schema({

    advanced: { type: String, required: true },
    days: { type: String, required: true },
    evidenceRequired: { type: String, required: true },
    label: { type: String, required: true },
    status: { type: String, required: true },

});

module.exports = mongoose.model('LeaveData', LeaveDataSchema, 'leavedatadb');
