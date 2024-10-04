const LeaveResign = require('../models/LeaveResignModel');

// สำหรับสร้างข้อมูล
exports.createLeaveResign = async (req, res) => {
    try {
        const newLeave = new LeaveResign(req.body);
        const savedLeave = await newLeave.save();
        res.json(savedLeave);
    } catch (err) {
        res.status(500).send('Server error'+err);
    }
    // res.status(200).send(req.body);
};

// สำหรับดูข้อมูลทั้งหมด
exports.getLeavesResign = async (req, res) => {
    try {
        const LeaveResigndb = await LeaveResign.find({});
        res.json(LeaveResigndb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// สำหรับดูข้อมูล ด้วย ID
exports.getLeaveResign = async (req, res) => {
    try {
        const leave = await LeaveResign.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(leave);
    } catch (err) {
        res.status(500).send('Server error');
    }
};


// สำหรับอัพเดตข้อมูล ด้วย ID
exports.updateLeaveResign = async (req, res) => {
    try {
        const { id } = req.params;
        const leave = await LeaveResign.findById(id);
        if (!leave) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        const updatedLeave = await LeaveResign.findByIdAndUpdate(id, req.body, {
            new: true
        });
        res.json(updatedLeave);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Route สำหรับดึงข้อมูล ด้วย lineId ทั้งหมด
exports.getLeaveResignByLineId = async (req, res) => {
    try {
        const LeaveResigndb = await LeaveResign.find({ lineId: req.params.lineId });
        if (LeaveResigndb.length === 0) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(LeaveResigndb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Route สำหรับดึงข้อมูล ด้วย initialLeaveApprover หรือ finalLeaveApprover
exports.getLeaveResignByApprover = async (req, res) => {
    try {
        const LeaveResigndb = await LeaveResign.find({ $or: [{ initialLeaveApprover: req.params.approver }, { finalLeaveApprover: req.params.approver }] });
        if (LeaveResigndb.length === 0) {
            return res.status(404).json({ msg: 'Leave not found' });
        }
        res.json(LeaveResigndb);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
