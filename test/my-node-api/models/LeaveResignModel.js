const mongoose = require('mongoose');

const LeaveResignSchema = new mongoose.Schema({

    firstWorkDay : { type: String, required: true },
    lastWorkDay : { type: String, required: true },
    needsCertification : { type: String, required: true },
    hasFunding : { type: String, required: true },
    status : { type: String, required: true },
    reasonText : { type: String, required: true },
    Type : { type: String, required: true },
    sendDate : { type: Date, required: true },
    initialLeaveApprover : { type: String , required: true },
    finalLeaveApprover : { type: String , required: true },
    lineId : { type: String, required: true },
    userId : { type: String, required: true },

});

module.exports = mongoose.model('LeaveResign', LeaveResignSchema, 'LeaveResigndb');
