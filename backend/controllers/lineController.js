const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const ConfigLine = require('../models/config_line');
const dbQuery = require('../utils/dbQuery');
const config = require('../config');
const factory = require('../helpers/handlerFactory');
const colors = require('colors');
const axios = require("axios");
const EventEmitter = require('events');
const e = require('express');
const moment = require('moment');
const WebhookLine = require('../models/webhook_line');
const LeaveTransaction = require('../models/leave_transaction');
const ObjectId = mongoose.Types.ObjectId;
const UsersModel = require('../models/users.js');
const LeaveTypeDetail = require('../models/leave_type_detail.js');
const LeaveTransactionQty = require('../models/leave_transaction_qty.js');

exports.webhook = catchAsync(async (req, res, next) => {
  console.log("is it in");

  try {
    // ค้นหาข้อมูลในฐานข้อมูล
    const configDoc = await ConfigLine.findOne();

    if (!configDoc) {
      return next(new AppError("No configuration found in CONFIGLINE collection", 400));
    }

    // const linetoken = configDoc.token;
    // q+gNQcZiQqK+Y9a5K61C3xDxtHer1oLXDvnPF/MDGLMxoFGJX2wk2zOS6z3iTHeM/EnKo2tXa9smdOJBpdCoBufWI/HwR0tMKGhz2Y688OsX6UD8/QdLSbJwxVimJmRjwtzHm8Rl3G5RwwdV+FzpJQdB04t89/1O/w1cDnyilFU=
    const linetoken = "q+gNQcZiQqK+Y9a5K61C3xDxtHer1oLXDvnPF/MDGLMxoFGJX2wk2zOS6z3iTHeM/EnKo2tXa9smdOJBpdCoBufWI/HwR0tMKGhz2Y688OsX6UD8/QdLSbJwxVimJmRjwtzHm8Rl3G5RwwdV+FzpJQdB04t89/1O/w1cDnyilFU=";




    if (req.body.events && req.body.events[0]) {


      const event = req.body.events[0];


      if (event.type === 'postback') {
        const object = {};
        const a = event.postback.data.split('&');
        a.forEach(e => {
          const b = e.split('=');
          object[`${b[0]}`] = b[1];
        });

        switch (object.action) {
          case 'leaveinform':
            if (ObjectId.isValid(object.leavetransactionid)) {
              await informleave(new ObjectId(object.leavetransactionid), object.approver, linetoken);
            } else {
              console.error('Invalid leave transaction ID');
            }
            break;
          case 'leaveapprove':
            if (ObjectId.isValid(object.leavetransactionid)) {
              await leaveapprove(new ObjectId(object.leavetransactionid), object.approver, linetoken);
            } else {
              console.error('Invalid leave transaction ID');
            }
            break;
          case 'leavereject':
            if (ObjectId.isValid(object.leavetransactionid)) {
              await leavereject(new ObjectId(object.leavetransactionid), object.approver, linetoken);
            } else {
              console.error('Invalid leave transaction ID');
            }
            break;
          default:
            console.error('Invalid action');
            break;
        }

      } else if (event.type === 'message') {
        switch (event.message.text) {
          case "ลงทะเบียน":
            register(event.source.userId, linetoken);
            break;
          case "ข้อมูลการลา":
            leavedata(event.source.userId, linetoken);
            break;
          case "ขอลาหยุด":
            leave(event.source.userId, linetoken);
            break;
          case "ขอลาออก":
            resign(event.source.userId, linetoken);
            break;
          case "ยกเลิกคำขอ":
            cancelLeave(event.source.userId, linetoken);
            break;
          case "ขอปฏิบัติงานนอกสถานที่":
            requestWorkOut(event.source.userId, linetoken);
            break;
          default:
            break;
        }
      }
    } else {
      return next(new AppError("Invalid event structure", 400, req.body));
    }

    // const body = JSON.stringify(req.body);

    // const result = await WebhookLine.create({ jsondate: body });

    res.status(200).json({
      status: 'insert data success',
      // data: result
    });

  } catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

// ฟังก์ชันรับทราบการลา
async function informleave(leavetransactionid, approver, linetoken) {
  try {
    const dataLeaveTransaction = await LeaveTransaction.findById(leavetransactionid);

    if (dataLeaveTransaction.status == 1 && dataLeaveTransaction.is_active == 1) {
      const dataUser = await UsersModel.findById(dataLeaveTransaction.fk_user_id);

      if (dataLeaveTransaction.leave_type) {
        try {
          const body = dataLeaveTransaction;
          let useDay = 0;
          let useHour = 0;
          let day = 0;
          let timesplit = 0;

          let [start, end] = [moment(body.leave_to_date), moment(body.leave_end_date)];
          let [time_start, time_end] = [body.time_start + ':00', body.time_end + ':00'];

          let [hours, minutes, seconds] = time_end.split(':').map(Number);
          if (hours >= 24) end.add(Math.floor(hours / 24), 'days');
          hours %= 24;

          let now = moment(`${start.format('YYYY-MM-DD')} ${time_start}`, 'YYYY-MM-DD HH:mm:ss');
          end = moment(`${end.format('YYYY-MM-DD')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, 'YYYY-MM-DD HH:mm:ss');

          let gethours = moment.duration(end.diff(now)).asHours()

          // console.log(gethours);

          if (gethours >= 24) {
            day = Math.floor(gethours / 24);
            timesplit = gethours - (24 * day);
            day = timesplit >= 8 ? day + 1 : day;
            timesplit = timesplit >= 8 ? 0 : timesplit;
          } 


          // console.log(day, timesplit);

          else if (gethours >= 8) {
            day = 1;
            timesplit = 0;
          }

          // console.log(day, timesplit);

          else {
            timesplit = gethours;
          }

          useDay = day;
          useHour = timesplit;

          // console.log(useDay, useHour);
          
          const employeeTypeId = dataUser.fk_employee_type_id;
          const leaveTypeId = body.leave_type;
          const year = moment().format('YYYY');

          console.log(employeeTypeId, leaveTypeId , year);

          const dataLeaveTypeDetail = await LeaveTypeDetail.findOne({
            FK_EMPLOYEE_TYPE_ID: String(employeeTypeId),
            FK_LEAVE_TYPE_ID: String(leaveTypeId),
            YEAR: Number(year)
          });

          if (!dataLeaveTypeDetail) {
            console.log('ไม่พบข้อมูลการลา');
          }

          let dataLeaveTransactionQty = await LeaveTransactionQty.findOne({
            fk_user_id: body.fk_user_id,
            fk_leave_type_id: body.leave_type,
            year: moment().format('YYYY')
            });

          // console.log(dataLeaveTransactionQty);

    
          // if (dataLeaveTransactionQty) {
          //   dataLeaveTransactionQty.hour += timesplit;
          //   dataLeaveTransactionQty.day += day;

          //   if (dataLeaveTransactionQty.hour >= 8) {
          //     dataLeaveTransactionQty.day += 1;
          //     dataLeaveTransactionQty.hour -= 8;
          //   }

          //   if (dataLeaveTypeDetail.QTY < (dataLeaveTransactionQty.day + (dataLeaveTransactionQty.hour / 10))) {
          //     await sendLineMessage(approver, `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.leave_code} \nเนื่องจาก: จำนวนวันไม่เพียงพอ`, linetoken);
          //     return false;
          //   }

          //   await dataLeaveTransactionQty.save();
          // } else {
          //   if (dataLeaveTypeDetail.QTY < day) {
          //     await sendLineMessage(approver, `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.leave_code}\nเนื่องจาก: จำนวนวันไม่เพียงพอ`, linetoken);
          //     return false;
          //   }

          //   const newLeaveTransactionQty = new LeaveTransactionQty({
          //     fk_user_id: body.fk_user_id,
          //     fk_leave_type_id: body.leave_type,
          //     year: moment().format('YYYY'),
          //     hour: timesplit,
          //     day: day
          //   });

          //   await newLeaveTransactionQty.save();
          // }
        } catch (err) {
          console.log(`informleave: err=${err}`);
        }
      }

      // await sendLineMessage(approver, `คุณได้รับทราบข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.leave_code} แล้ว`, linetoken);

      // dataLeaveTransaction.status = 2;
      // dataLeaveTransaction.primary_approve = 1;
      // dataLeaveTransaction.primary_approved_date = moment().format('YYYY-MM-DD HH:mm:ss');
      // dataLeaveTransaction.updated_date = moment().format('YYYY-MM-DD HH:mm:ss');
      // await dataLeaveTransaction.save();

      // await sendApproveToEmployee(dataUser, dataLeaveTransaction, linetoken);
      // return true;
    }
    // else {
    //   await sendLineMessage(approver, `ไม่สามารถบันทึกข้อมูล\nการลาเลขที่: ${dataLeaveTransaction.leave_code} ซ้ำได้`, linetoken);
    //   return true;
    // }
  } catch (err) {
    return false;
  }
}

// ฟังก์ชันไม่อนุมัติการลา
async function leavereject(leavetransactionid, approver, linetoken) {
  // try {
    const dataLeaveTransaction = await LeaveTransaction.findById(leavetransactionid);

    if (dataLeaveTransaction.status == 1 && dataLeaveTransaction.is_active == 1) {
      dataLeaveTransaction.status = 3;
      dataLeaveTransaction.primary_approve = 0;
      dataLeaveTransaction.primary_approved_date = moment().format('YYYY-MM-DD HH:mm:ss');
      dataLeaveTransaction.updated_date = moment().format('YYYY-MM-DD HH:mm:ss');
      // await dataLeaveTransaction.save();

      console.log(`คุณไม่อนุมัติข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.leave_code}`);
      // await sendLineMessage(approver, `คุณไม่อนุมัติข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.leave_code}`, linetoken);

      // const dataUser = await User.findById(dataLeaveTransaction.fk_user_id);
      // await sendRejectToEmployee(dataUser, dataLeaveTransaction, linetoken);
      // return true;
    } 
    
    // else {
    //   await sendLineMessage(approver, `ไม่สามารถบันทึกข้อมูล\nการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} ซ้ำได้`, linetoken);
    //   return true;
    // }
  // } catch (err) {
  //   console.log(`err: ${err}`);
  //   return false;
  // }
}

// ฟังก์ชันอนุมัติการลา
async function leaveapprove(leavetransactionid, approver, linetoken) {
  try {
    const dataLeaveTransaction = await LeaveTransaction.findById(leavetransactionid);
    if (dataLeaveTransaction.STATUS == 1 && dataLeaveTransaction.is_active == 1) {
      const dataUser = await User.findById(dataLeaveTransaction.fk_user_id);

      const body = dataLeaveTransaction;
      let useDay = 0;
      let useHour = 0;
      const now = moment(`${moment(body.LEAVE_TO_DATE).format('YYYY-MM-DD')} ${moment(body.TIME_START).utc().format('HH:mm')}`);
      const end = moment(`${moment(body.LEAVE_END_DATE).format('YYYY-MM-DD')} ${moment(body.TIME_END).utc().format('HH:mm')}`);
      const duration = moment.duration(end.diff(now));
      const gethours = duration.asHours();
      let day = 0;
      let timesplit = 0;

      if (gethours >= 24) {
        day = Math.floor(gethours / 24);
        timesplit = gethours - (24 * day);
        day = timesplit >= 8 ? day + 1 : day;
        timesplit = timesplit >= 8 ? 0 : timesplit;
      } else if (gethours >= 8) {
        day = 1;
        timesplit = 0;
      } else {
        timesplit = gethours;
      }
      useDay = day;
      useHour = timesplit;

      const dataLeaveTypeDetail = await LeaveTypeDetail.findOne({
        FK_EMPLOYEE_TYPE_ID: dataUser.FK_EMPLOYEE_TYPE_ID,
        FK_LEAVE_TYPE_ID: body.LEAVE_TYPE,
        YEAR: moment().format('YYYY')
      });

      let dataLeaveTransactionQty = await LeaveTransactionQty.findOne({
        fk_user_id: body.fk_user_id,
        FK_LEAVE_TYPE_ID: body.LEAVE_TYPE,
        YEAR: moment().format('YYYY')
      });

      if (dataLeaveTransactionQty) {
        dataLeaveTransactionQty.HOUR += timesplit;
        dataLeaveTransactionQty.DAY += day;

        if (dataLeaveTransactionQty.HOUR >= 8) {
          dataLeaveTransactionQty.DAY += 1;
          dataLeaveTransactionQty.HOUR -= 8;
        }

        if (dataLeaveTypeDetail.QTY < (dataLeaveTransactionQty.DAY + (dataLeaveTransactionQty.HOUR / 10))) {
          await sendLineMessage(approver, `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} \nเนื่องจาก: จำนวนวันไม่เพียงพอ`, linetoken);
          return false;
        }

        await dataLeaveTransactionQty.save();
      } else {
        if (dataLeaveTypeDetail.QTY < day) {
          await sendLineMessage(approver, `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE}\nเนื่องจาก: จำนวนวันไม่เพียงพอ`, linetoken);
          return false;
        }

        const newLeaveTransactionQty = new LeaveTransactionQty({
          fk_user_id: body.fk_user_id,
          FK_LEAVE_TYPE_ID: body.LEAVE_TYPE,
          YEAR: moment().format('YYYY'),
          HOUR: timesplit,
          DAY: day
        });

        await newLeaveTransactionQty.save();
      }

      await sendLineMessage(approver, `คุณได้อนุมัติข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.LEAVE_CODE} แล้ว`, linetoken);

      if (dataLeaveTransaction.IS_RETIRE) {
        dataUser.LAST_WORK = moment(dataLeaveTransaction.LEAVE_TO_DATE).format('YYYY-MM-DD');
        await dataUser.save();
      }

      dataLeaveTransaction.STATUS = 2;
      dataLeaveTransaction.PRIMARY_APPROVE = 1;
      dataLeaveTransaction.PRIMARY_APPROVED_DATE = moment().format('YYYY-MM-DD HH:mm:ss');
      dataLeaveTransaction.UPDATED_DATE = moment().format('YYYY-MM-DD HH:mm:ss');
      await dataLeaveTransaction.save();

      await sendApproveToEmployee(dataUser, dataLeaveTransaction, linetoken);
      return true;
    } else {
      await sendLineMessage(approver, `ไม่สามารถบันทึกข้อมูล\nการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} ซ้ำได้`, linetoken);
      return true;
    }
  } catch (err) {
    console.log(`err: ${err}`);
    return false;
  }
}

// ฟังก์ชันช่วยส่งข้อความทาง LINE
async function sendLineMessage(to, message, linetoken) {
  const data = {
    "to": to,
    "messages": [
      {
        "type": "text",
        "text": message
      }
    ]
  };

  try {
    await axios.post(`https://api.line.me/v2/bot/message/push`, data, {
      headers: {
        'Authorization': `Bearer ${linetoken}`,
      },
    });
  } catch (err) {
    console.log(`Error sending LINE message: ${err}`);
  }
}

// ฟังก์ชันส่งการอนุมัติไปยังพนักงาน
async function sendApproveToEmployee(dataUser, dataLeaveTransaction, linetoken) {
  try {
    let data = {};
    if (dataLeaveTransaction.IS_WORK_OUTSIDE) {
      data = {
        "to": dataUser.LINE_USERID,
        "messages": [
          {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "คำขอออกนอกสถานที่ของท่าน",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "ได้รับการอนุมัติแล้ว",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `เลขการลา: ${dataLeaveTransaction.LEAVE_CODE}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  }
                ]
              },
              "footer": {
                "type": "box",
                "layout": "vertical",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                      "type": "uri",
                      "label": "ดาวน์โหลดเอกสาร",
                      "uri": `${process.env.APIURL}/api/leave/exportPDFLeaveOffsiteWork?type=file&leaveTransactionID=${dataLeaveTransaction.id}`
                    },
                    "color": "#4CD964",
                    "adjustMode": "shrink-to-fit"
                  },
                  {
                    "type": "text",
                    "text": `วันที่ขอออกนอกสถานที่`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `${moment().format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                ]
              }
            }
          }
        ]
      };
    } else if (dataLeaveTransaction.IS_RETIRE) {
      data = {
        "to": dataUser.LINE_USERID,
        "messages": [
          {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "ทางบริษัท ฯ",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "ได้รับคำขอของท่านแล้ว",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `เลขการลา: ${dataLeaveTransaction.LEAVE_CODE}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `วันที่ขอลาออก ${moment().format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "กรุณารอฝ่ายบุคคลติดต่อกลับ",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                ]
              },
            }
          }
        ]
      };
    } else {
      data = {
        "to": dataUser.LINE_USERID,
        "messages": [
          {
            "type": "flex",
            "altText": "this is a flex message",
            "contents": {
              "type": "bubble",
              "body": {
                "type": "box",
                "layout": "vertical",
                "contents": [
                  {
                    "type": "text",
                    "text": "คำขอลาหยุดของท่าน",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": "ได้รับการอนุมัติแล้ว",
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `เลขการลา: ${dataLeaveTransaction.LEAVE_CODE}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                  {
                    "type": "text",
                    "text": `วันที่ขอลาหยุด ${moment().format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  }
                ]
              },
              "footer": {
                "type": "box",
                "layout": "horizontal",
                "spacing": "sm",
                "contents": [
                  {
                    "type": "button",
                    "style": "primary",
                    "height": "sm",
                    "action": {
                      "type": "uri",
                      "label": "ดาวน์โหลดเอกสาร",
                      "uri": `${process.env.APIURL}/api/leave/exportPDFLeave?type=file&leaveTransactionID=${dataLeaveTransaction.id}`
                    },
                    "color": "#4CD964",
                    "adjustMode": "shrink-to-fit"
                  }
                ]
              }
            }
          }
        ]
      };
    }

    await axios.post(`https://api.line.me/v2/bot/message/push`, data, {
      headers: {
        'Authorization': `Bearer ${linetoken}`,
      },
    });
    return true;
  } catch (err) {
    console.log('error: ', err);
    return false;
  }
}

// ฟังก์ชันส่งการปฏิเสธไปยังพนักงาน
async function sendRejectToEmployee(dataUser, dataLeaveTransaction, linetoken) {
  try {
    const data = {
      "to": dataUser.LINE_USERID,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "คำขอของคุณได้รับการปฏิเสธ",
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เลขคำขอ: ${dataLeaveTransaction.LEAVE_CODE}`,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เมื่อวันที่ ${moment().format('DD/MM/YYYY')}`,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
                {
                  "type": "text",
                  "text": `เนื่องจาก: ${dataLeaveTransaction.PRIMARY_APPROVE_DESCRIPTION ?? '-'}`,
                  "wrap": true,
                  "weight": "bold",
                  "size": "lg",
                  "align": "center"
                },
              ]
            },
          }
        }
      ]
    };

    await axios.post(`https://api.line.me/v2/bot/message/push`, data, {
      headers: {
        'Authorization': `Bearer ${linetoken}`,
      },
    });
    return true;
  } catch (err) {
    console.log('error: ', err);
    return false;
  }
}

//ลงทะเบียน
async function register(userid, linetoken) {
  try {
    // Define the data for the LINE message.
    var data = {
      "to": userid,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "ลงทะเบียน",
                    "uri": `${process.env.USERURL}/Register/` + userid
                  },
                  "color": "#4CD964",
                  "adjustMode": "shrink-to-fit"
                }
              ]
            }
          }
        }
      ]
    }

    // Send the LINE message.
    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      });

    // Insert the track data into the database.
    await WebhookLine.create({ jsondate: data });
  }
  catch (err) {
    // Insert the track data into the database.
    await WebhookLine.create({ jsondate: err });
  }
}

//ดูข้อมูล
async function leavedata(userid, linetoken) {
  var tracktxt = "";
  try {
    var data = {
      "to": userid,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "ดูข้อมูล",
                    "uri": `${process.env.USERURL}/Home/` + userid
                  },
                  "color": "#4CD964",
                  "adjustMode": "shrink-to-fit"
                }
              ]
            }
          }
        }
      ]
    }

    tracktxt += `body: ${JSON.stringify(data)}|`;
    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        tracktxt += JSON.stringify(response.data);
      })
      .catch(async (err) => {
        console.log(`err1: ${err}`);
        tracktxt += "ERROR: " + err + "| ";
        await WebhookLine.create({ jsondata: tracktxt });
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += "ERROR catch: " + err + "| ";
  }
  await WebhookLine.create({ jsondata: tracktxt });
  return null;
}

//ขอลาหยุด
async function leave(userid, linetoken) {
  var tracktxt = "";
  try {
    var data = {
      "to": userid,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "ขอลาหยุด",
                    "uri": `${process.env.USERURL}/Leave/` + userid
                  },
                  "color": "#4CD964",
                  "adjustMode": "shrink-to-fit"
                }
              ]
            }
          }
        }
      ]
    }

    tracktxt += `body: ${JSON.stringify(data)}| `;
    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        tracktxt += JSON.stringify(response.data);
      })
      .catch(async (err) => {
        console.log(`err1: ${err}`);
        tracktxt += "ERROR: " + err + "| ";
        await WebhookLine.create({ jsondata: tracktxt });
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += "ERROR catch: " + err + "| ";
  }
  await WebhookLine.create({ jsondata: tracktxt });
  return null;
}

//ขอลาออก
async function resign(userid, linetoken) {
  var tracktxt = "";
  try {
    var data = {
      "to": userid,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "ขอลาออก",
                    "uri": `${process.env.USERURL}/Resign/` + userid
                  },
                  "color": "#4CD964",
                  "adjustMode": "shrink-to-fit"
                }
              ]
            }
          }
        }
      ]
    }

    tracktxt += `body: ${JSON.stringify(data)}|`;
    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        tracktxt += JSON.stringify(response.data);
      })
      .catch(async (err) => {
        console.log(`err1: ${err}`);
        tracktxt += "ERROR: " + err + "| ";
        await WebhookLine.create({ jsondata: tracktxt });
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += "ERROR catch: " + err + "| ";
  }
  await WebhookLine.create({ jsondata: tracktxt });
  return null;
}

//ยกเลิกการลา
async function cancelLeave(userid, linetoken) {
  var tracktxt = "";
  try {
    var data = {
      "to": userid,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "direction": "ltr",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "Header",
                  "align": "center",
                  "contents": []
                }
              ]
            },
            "hero": {
              "type": "image",
              "url": "https://vos.line-scdn.net/bot-designer-template-images/bot-designer-icon.png",
              "size": "full",
              "aspectRatio": "1.51:1",
              "aspectMode": "fit"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "Body",
                  "align": "center",
                  "contents": []
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "uri",
                    "label": "ยกเลิกการลา",
                    "uri": `${process.env.USERURL}/Home/` + userid
                  }
                }
              ]
            }
          }
        }
      ]
    }

    tracktxt += `body: ${JSON.stringify(data)}|`;
    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        tracktxt += JSON.stringify(response.data);
      })
      .catch(async (err) => {
        console.log(`err1: ${err}`);
        tracktxt += "ERROR: " + err + "| ";
        await WebhookLine.create({ jsondata: tracktxt });
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += "ERROR catch: " + err + "| ";
  }
  await WebhookLine.create({ jsondata: tracktxt });
  return null;
}


//ขอปฏิบัติงานนอกสถานที่
async function requestWorkOut(userid, linetoken) {
  var tracktxt = "";
  try {
    var data = {
      "to": userid,
      "messages": [
        {
          "type": "flex",
          "altText": "this is a flex message",
          "contents": {
            "type": "bubble",
            "footer": {
              "type": "box",
              "layout": "horizontal",
              "spacing": "sm",
              "contents": [
                {
                  "type": "button",
                  "style": "primary",
                  "height": "sm",
                  "action": {
                    "type": "uri",
                    "label": "ขอปฏิบัติงานนอกสถานที่",
                    "uri": `${process.env.USERURL}/OffsiteWork/` + userid
                  },
                  "color": "#4CD964",
                  "adjustMode": "shrink-to-fit"
                }
              ]
            }
          }
        }
      ]
    }
    tracktxt += `body: ${JSON.stringify(data)}|`;
    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        tracktxt += JSON.stringify(response.data);
      })
      .catch(async (err) => {
        console.log(`err1: ${err}`);
        tracktxt += "ERROR: " + err + "| ";
        await WebhookLine.create({ jsondata: tracktxt });
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += "ERROR catch: " + err + "| ";
  }
  await WebhookLine.create({ jsondata: tracktxt });
  return null;
}