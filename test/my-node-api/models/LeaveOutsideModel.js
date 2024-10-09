const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({

    userId : { type: String, required: true },
    lineId : { type: String, required: true },
    workLocation : { type: String, required: true },
    vehicle : { type: String, required: true },
    vehicleNumber : { type: String, required: true },
    startDate : { type: String, required: true },
    endDate : { type: String, required: true },
    startTime : { type: String, required: true },
    endTime : { type: String, required: true },
    status : { type: String, required: true },
    sendDate : { type: Date, required: true },
    initialLeaveApprover: { type: String , required: true },
    finalLeaveApprover: { type: String , required: true },
    type: { type: String, required: true },
    imageUrl: { type: String, required: true },
  
});

module.exports = mongoose.model('LeaveOutside', leaveSchema, 'LeaveOutsidedb');
