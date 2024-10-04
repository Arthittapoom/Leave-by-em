const LeaveOutside = require('../models/LeaveOutsideModel');

// สำหรับสร้างข้อมูล
exports.createLeaveOutside = async (req, res) => {
    try {
        const newLeave = new LeaveOutside(req.body);
        const savedLeave = await newLeave.save();
        res.json(savedLeave);
    } catch (err) {
        res.status(500).send('Server error'+err);
    }
    // res.status(200).send(req.body);
};

// สำหรับดูข้อมูลทั้งหมด
exports.getLeavesOutside = async (req, res) => {
    try {
        const LeaveOutsidedb = await LeaveOutside.find({});
        res.json(LeaveOutsidedb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// สำหรับดูข้อมูล ด้วย ID
exports.getLeaveOutside = async (req, res) => {
    try {
        const leave = await LeaveOutside.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(leave);
    } catch (err) {
        res.status(500).send('Server error');
    }
};


// สำหรับอัพเดตข้อมูล ด้วย ID
exports.updateLeaveOutside = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await LeaveOutside.findById(id);
        if (!leave) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        const updatedLeave = await LeaveOutside.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updatedLeave);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Route สำหรับดึงข้อมูล ด้วย lineId ทั้งหมด
exports.getLeaveOutsideByLineId = async (req, res) => {
    try {
        const LeaveOutsidedb = await LeaveOutside.find({ lineId: req.params.lineId });
        if (LeaveOutsidedb.length === 0) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(LeaveOutsidedb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Route สำหรับดึงข้อมูล ด้วย initialLeaveApprover หรือ finalLeaveApprover
exports.getLeaveOutsideByApprover = async (req, res) => {
    try {
        const LeaveOutsidedb = await LeaveOutside.find({ $or: [{ initialLeaveApprover: req.params.approver }, { finalLeaveApprover: req.params.approver }] });
        if (LeaveOutsidedb.length === 0) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(LeaveOutsidedb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
