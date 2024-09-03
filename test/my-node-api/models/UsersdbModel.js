const mongoose = require('mongoose');

const usersdbSchema = new mongoose.Schema({
    index: { type: String, required: true }, // ลำดับ
    code: { type: String, required: true }, // รหัส
    department: { type: String, required: true }, // สังกัด
    name: { type: String, required: true }, // ชื่อ-สกุล
    nickname: { type: String, required: true }, // ชื่อเล่น
    position: { type: String, required: true }, // ตำแหน่ง
    employeeType: { type: String, required: true }, // ประเภทพนักงาน
    division: { type: String, required: true }, // ฝ่าย
    workplace: { type: String, required: true }, // สถานที่ปฏิบัติงาน
    startDate: { type: String, required: true }, // วันที่เริ่มงาน
    passedDate: { type: String, required: true }, // วันที่ผ่านโปร
    diffDays_days: { type: String, required: true }, // อายุงาน (วัน)
    diffDays_months: { type: String, required: true }, // อายุงาน (เดือน)
    diffDays_years: { type: String, required: true }, // อายุงาน (ปี)
    initialLeaveApprover: { type: String }, // ผู้อนุมัติการลาขั้นต้น
    finalLeaveApprover: { type: String }, // ผู้อนุมัติสูงสุด
    diffDays_days_exl: { type: String }, // จำนวนวันทำงาน จาก Excel
    sickLeave_days: { type: String }, // ป่วย/วัน
    sickLeave_hours: { type: String }, // ป่วย/ชม.
    totalSickLeave: { type: String }, // รวมวันลาป่วย
    remainingSickLeave: { type: String }, // สิทธิ์คงเหลือวันลาป่วย
    personalLeave_days: { type: String }, // กิจ/วัน
    personalLeave_hours: { type: String }, // กิจ/ชม.
    totalPersonalLeave: { type: String }, // รวมวันลากิจ
    remainingPersonalLeave: { type: String }, // สิทธิ์คงเหลือวันลากิจ
    vacationLeave_days: { type: String }, // พักร้อน/วัน
    vacationLeave_hours: { type: String }, // พักร้อน/ชม.
    totalVacationLeave: { type: String }, // รวมพักร้อน
    remainingVacationLeave: { type: String }, // สิทธิ์คงเหลือวันพักร้อน
    grantedVacationLeave: { type: String }, // สิทธิ์พักร้อนที่ได้
    unpaidLeave_days: { type: String }, // ไม่รับค่าจ้าง/วัน
    unpaidLeave_hours: { type: String }, // ไม่รับค่าจ้าง/ชม.
    totalUnpaidLeave: { type: String }, // รวมไม่รับค่าจ้าง
    specialPersonalLeave: { type: String }, // ลากิจพิเศษ
    ordinationLeave: { type: String }, // ลาเพื่ออุปสมบท
    maternityLeave: { type: String }, // ลาคลอด
    workInjuryLeave_days: { type: String }, // ลาป่วย (เนื่องจากบาดเจ็บในงาน)/วัน

    lineId: { type: String , default: 'null'}, // Line ID
    phone: { type: String , default: 'null'}, // โทรศัพท์
});

module.exports = mongoose.model('Users', usersdbSchema, 'usersdb');
