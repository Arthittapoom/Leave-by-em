const catchAsync = require('../utils/catchAsync');
const config = require('../config');
const factory = require('../helpers/handlerFactory');
const colors = require('colors');
const axios = require("axios");
const EventEmitter = require('events');
const dbQuery = require('../utils/dbQuery');
const e = require('express');
const moment = require('moment');

exports.webhook = catchAsync(async (req, res, next) => {
  console.log("is it in")
  try {
    var body = JSON.stringify(req.body);
    let pool = await new dbQuery().connect();
    var sql = `SELECT TOP 1 [TOKEN] FROM [CONFIGLINE]`;
    var result = await pool.query(sql);
    var linetoken = result.recordset[0].TOKEN;
    try {
      if (req.body.events[0].type == 'postback') {
        var object = {};
        var a = req.body.events[0].postback.data.split('&');
        a.forEach(e => {
          var b = e.split('=');
          try {
            object[`${b[0]}`] = b[1];
          }
          catch { }
        });

        switch (object.action) {
          case 'leaveinform':
            await informleave(object.leavetransactionid, object.approver, linetoken);
            break;
          case 'leaveapprove':
            await leaveapprove(object.leavetransactionid, object.approver, linetoken);
            break;
          case 'leavereject':
            await leavereject(object.leavetransactionid, object.approver, linetoken);
            break;
          default:
            break;
        }
      }
      else if (req.body.events[0].type == 'message') {
        switch (req.body.events[0].message.text) {
          case "ลงทะเบียน":
            register(req.body.events[0].source.userId, linetoken);
            break;
          case "ข้อมูลการลา":
            leavedata(req.body.events[0].source.userId, linetoken);
            break;
          case "ขอลาหยุด":
            leave(req.body.events[0].source.userId, linetoken);
            break;
          case "ขอลาออก":
            resign(req.body.events[0].source.userId, linetoken);
            break;
          case "ยกเลิกคำขอ":
            cancelLeave(req.body.events[0].source.userId, linetoken);
            break;
          case "ขอปฏิบัติงานนอกสถานที่":
            requestWorkOut(req.body.events[0].source.userId, linetoken);
            break;
          default:
            break;
        }
      }
    }
    catch {

    }

    pool = await new dbQuery().connect();
    sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${body}')`;
    result = await pool.query(sql);
    res.status(200).json({
      status: 'insert data success',
      data: result
    });
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

//รับทราบลาหยุด
async function informleave(leavetransactionid, approver, linetoken) {
  var pool = await new dbQuery().connect();
  var sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${leavetransactionid}`;
  var result = await pool.query(sql);
  var dataLeaveTransaction = result.recordset[0];
  if (dataLeaveTransaction.STATUS == 1 && dataLeaveTransaction.IS_ACTIVE == 1) {
    pool = await new dbQuery().connect();
    sql = `SELECT * FROM [USER] WHERE id = ${dataLeaveTransaction.FK_USER_ID}`;
    result = await pool.query(sql);
    var dataUser = result.recordset[0];

    if (dataLeaveTransaction.LEAVE_TYPE) {
      try {
        var body = dataLeaveTransaction;
        var useDay = 0;
        var useHour = 0;
        var now = moment(moment(body.LEAVE_TO_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_START).utc().format('HH:mm'));
        var end = moment(moment(body.LEAVE_END_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_END).utc().format('HH:mm'));
        var duration = moment.duration(end.diff(now));
        var gethours = duration.asHours();
        var day = 0;
        var timesplit = 0;
        // console.log('gethours',gethours);
        if (gethours >= 24) {
          day = Number(((gethours / 24) + '').split('.')[0]);
          // console.log('day', day);
          timesplit = (gethours - (24 * day));
          // console.log('timesplit', timesplit);
          day = timesplit >= 8 ? Number(day) + 1 : day;
          // console.log('day2', day);
          timesplit = timesplit >= 8 ? 0 : timesplit;
          // console.log('timesplit2', timesplit);
        }
        else if (gethours >= 8) {
          day = 1;
          timesplit = 0;
        }
        else {
          timesplit = gethours;
        }
        useDay = day;
        useHour = timesplit;
        console.log('useDay', useDay);
        console.log('useHour', useHour);

        sql = `SELECT * FROM [LEAVE_TYPE_DETAIL] WHERE FK_EMPLOYEE_TYPE_ID = ${dataUser.FK_EMPLOYEE_TYPE_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
        result = await pool.query(sql);
        var dataLeaveTypeDetail = result.recordset[0];
        sql = `SELECT * FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = ${body.FK_USER_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
        result = await pool.query(sql);
        if (result.rowsAffected[0] > 0) {
          result.recordset[0].HOUR += Number(timesplit);
          result.recordset[0].DAY += Number(day);

          if (result.recordset[0].HOUR >= 8) {
            result.recordset[0].DAY += 1;
            result.recordset[0].HOUR = result.recordset[0].HOUR - 8;
          }

          console.log('result.recordset[0].DAY', result.recordset[0].DAY);
          console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
          // console.log('dataLeaveTypeDetail.QTY', dataLeaveTypeDetail.QTY);
          // console.log('result.recordset[0].DAY', result.recordset[0].DAY);
          // console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
          // console.log('result.recordset[0].HOUR 2', result.recordset[0].HOUR / 10);
          // console.log('result.recordset[0].HOUR 3', (result.recordset[0].DAY + (result.recordset[0].HOUR / 10)));
          if (dataLeaveTypeDetail.QTY < (result.recordset[0].DAY + (result.recordset[0].HOUR / 10))) {
            // if (dataLeaveTypeDetail.QTY < result.recordset[0].DAY + result.recordset[0].HOUR) {
            try {
              var data3 = {
                "to": approver,
                "messages": [
                  {
                    "type": "text",
                    "text": `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} \nเนื่องจาก: จำนวนวันไม่เพียงพอ`
                  }
                ]
              }

              await axios
                .post(`https://api.line.me/v2/bot/message/push`, data3, {
                  headers: {
                    'Authorization': "Bearer " + linetoken,
                  },
                })
                .then((response) => {
                })
                .catch(async (err) => {
                  console.log(`err send line approver: ${err}`);
                });
            }
            catch (err) {
              console.log(`err catch send line approver: ${err}`);
            }

            return false;
          }

          let updatevalueArr = [
            `[HOUR] = '${Number(result.recordset[0].HOUR)}'`,
            `[DAY] = '${Number(result.recordset[0].DAY)}'`,
          ]

          pool = await new dbQuery().connect();
          sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET ${updatevalueArr} WHERE id = '${result.recordset[0].id}'`;
          result = await pool.query(sql);
        }
        else {
          if (dataLeaveTypeDetail.QTY < day) {
            try {
              var data3 = {
                "to": approver,
                "messages": [
                  {
                    "type": "text",
                    "text": `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE}\nเนื่องจาก: จำนวนวันไม่เพียงพอ`
                  }
                ]
              }

              await axios
                .post(`https://api.line.me/v2/bot/message/push`, data3, {
                  headers: {
                    'Authorization': "Bearer " + linetoken,
                  },
                })
                .then((response) => {
                })
                .catch(async (err) => {
                  console.log(`err send line approver: ${err}`);
                });
            }
            catch (err) {
              console.log(`err catch send line approver: ${err}`);
            }

            return false;
          }

          let columnQTYArr = [
            "[FK_USER_ID]",
            "[FK_LEAVE_TYPE_ID]",
            "[YEAR]",
            "[HOUR]",
            "[DAY]"
          ]

          let valueQTYArr = [
            `'${body.FK_USER_ID}'`,
            `'${body.LEAVE_TYPE}'`,
            `'${moment(new Date()).format('YYYY')}'`,
            `'${timesplit}'`,
            `'${day}'`,
          ]

          pool = await new dbQuery().connect();
          sql = `INSERT INTO [LEAVE_TRANSACTION_QTY] (${columnQTYArr}) OUTPUT Inserted.id VALUES (${valueQTYArr})`;
          result = await pool.query(sql);
        }
      }
      catch (err) {
        console.log(err);
      }
    }

    try {
      var data = {
        "to": approver,
        "messages": [
          {
            "type": "text",
            "text": `คุณได้รับทราบข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.LEAVE_CODE} แล้ว`
          }
        ]
      }

      await axios
        .post(`https://api.line.me/v2/bot/message/push`, data, {
          headers: {
            'Authorization': "Bearer " + linetoken,
          },
        })
        .then((response) => {
          // console.log(response);
        })
        .catch(async (err) => {
          console.log(`err send line approver: ${err}`);
        });
    }
    catch (err) {
      console.log(`err catch send line approver: ${err}`);
    }

    let updatevalueArr = [
      `[STATUS] = '2'`,
      `[PRIMARY_APPROVE] = '1'`,
      `[PRIMARY_APPROVED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]
    pool = await new dbQuery().connect();
    sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${leavetransactionid}'`;
    result = await pool.query(sql);

    await sendApproveToEmployee(dataUser, dataLeaveTransaction, linetoken);
    return true;
  }
  else {
    var data = {
      "to": approver,
      "messages": [
        {
          "type": "text",
          "text": `ไม่สามารถบันทึกข้อมูล\nการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} ซ้ำได้`
        }
      ]
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
      })
      .catch(async (err) => {
        console.log(`err send line approver: ${err}`);
      });
    return true;
  }
}

//ไม่อนุมัติลาหยุด
async function leavereject(leavetransactionid, approver, linetoken) {
  var pool = await new dbQuery().connect();
  var sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${leavetransactionid}`;
  var result = await pool.query(sql);
  var dataLeaveTransaction = result.recordset[0];
  if (dataLeaveTransaction.STATUS == 1 && dataLeaveTransaction.IS_ACTIVE == 1) {
    let updatevalueArr = [
      `[STATUS] = '3'`,
      `[PRIMARY_APPROVE] = '0'`,
      `[PRIMARY_APPROVED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    pool = await new dbQuery().connect();
    sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${leavetransactionid}'`;
    result = await pool.query(sql);

    try {
      var data = {
        "to": approver,
        "messages": [
          {
            "type": "text",
            "text": `คุณไม่อนุมัติข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.LEAVE_CODE}`
          }
        ]
      }

      await axios
        .post(`https://api.line.me/v2/bot/message/push`, data, {
          headers: {
            'Authorization': "Bearer " + linetoken,
          },
        })
        .then((response) => {
        })
        .catch(async (err) => {
          console.log(`err send line approver: ${err}`);
        });
    }
    catch (err) {
      console.log(`err catch send line approver: ${err}`);
    }

    pool = await new dbQuery().connect();
    sql = `SELECT * FROM [USER] WHERE id = ${dataLeaveTransaction.FK_USER_ID}`;
    result = await pool.query(sql);
    var dataUser = result.recordset[0];

    await sendRejectToEmployee(dataUser, dataLeaveTransaction, linetoken);
    return true;
  }
  else {
    var data = {
      "to": approver,
      "messages": [
        {
          "type": "text",
          "text": `ไม่สามารถบันทึกข้อมูล\nการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} ซ้ำได้`
        }
      ]
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
      })
      .catch(async (err) => {
        console.log(`err send line approver: ${err}`);
      });
    return true;
  }
}

//อนุมัติลาหยุด
async function leaveapprove(leavetransactionid, approver, linetoken) {
  var pool = await new dbQuery().connect();
  var sql = `SELECT * FROM [LEAVE_TRANSACTION] WHERE id = ${leavetransactionid}`;
  var result = await pool.query(sql);
  var dataLeaveTransaction = result.recordset[0];
  console.log('dataLeaveTransaction.STATUS', dataLeaveTransaction.STATUS);
  if (dataLeaveTransaction.STATUS == 1 && dataLeaveTransaction.IS_ACTIVE == 1) {
    pool = await new dbQuery().connect();
    sql = `SELECT * FROM [USER] WHERE id = ${dataLeaveTransaction.FK_USER_ID}`;
    result = await pool.query(sql);
    var dataUser = result.recordset[0];

    try {
      var body = dataLeaveTransaction;
      var useDay = 0;
      var useHour = 0;
      var now = moment(moment(body.LEAVE_TO_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_START).utc().format('HH:mm'));
      var end = moment(moment(body.LEAVE_END_DATE).format('YYYY-MM-DD') + ' ' + moment(body.TIME_END).utc().format('HH:mm'));
      var duration = moment.duration(end.diff(now));
      var gethours = duration.asHours();
      var day = 0;
      var timesplit = 0;
      // console.log('gethours',gethours);
      if (gethours >= 24) {
        day = Number(((gethours / 24) + '').split('.')[0]);
        // console.log('day', day);
        timesplit = (gethours - (24 * day));
        // console.log('timesplit', timesplit);
        day = timesplit >= 8 ? Number(day) + 1 : day;
        // console.log('day2', day);
        timesplit = timesplit >= 8 ? 0 : timesplit;
        // console.log('timesplit2', timesplit);
      }
      else if (gethours >= 8) {
        day = 1;
        timesplit = 0;
      }
      else {
        timesplit = gethours;
      }
      useDay = day;
      useHour = timesplit;
      // console.log('useDay', useDay);
      // console.log('useHour', useHour);

      sql = `SELECT * FROM [LEAVE_TYPE_DETAIL] WHERE FK_EMPLOYEE_TYPE_ID = ${dataUser.FK_EMPLOYEE_TYPE_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
      result = await pool.query(sql);
      var dataLeaveTypeDetail = result.recordset[0];
      sql = `SELECT * FROM [LEAVE_TRANSACTION_QTY] WHERE FK_USER_ID = ${body.FK_USER_ID} AND FK_LEAVE_TYPE_ID = ${body.LEAVE_TYPE} AND YEAR = '${moment(new Date()).format('YYYY')}'`;
      result = await pool.query(sql);
      if (result.rowsAffected[0] > 0) {
        result.recordset[0].HOUR += Number(timesplit);
        result.recordset[0].DAY += Number(day);

        if (result.recordset[0].HOUR >= 8) {
          result.recordset[0].DAY += 1;
          result.recordset[0].HOUR = result.recordset[0].HOUR - 8;
        }

        console.log('result.recordset[0].DAY', result.recordset[0].DAY);
        console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
        // console.log('dataLeaveTypeDetail.QTY', dataLeaveTypeDetail.QTY);
        // console.log('result.recordset[0].DAY', result.recordset[0].DAY);
        // console.log('result.recordset[0].HOUR', result.recordset[0].HOUR);
        // console.log('result.recordset[0].HOUR 2', result.recordset[0].HOUR / 10);
        // console.log('result.recordset[0].HOUR 3', (result.recordset[0].DAY + (result.recordset[0].HOUR / 10)));
        if (dataLeaveTypeDetail.QTY < (result.recordset[0].DAY + (result.recordset[0].HOUR / 10))) {
          // if (dataLeaveTypeDetail.QTY < result.recordset[0].DAY + result.recordset[0].HOUR) {
          try {
            var data3 = {
              "to": approver,
              "messages": [
                {
                  "type": "text",
                  "text": `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} \nเนื่องจาก: จำนวนวันไม่เพียงพอ`
                }
              ]
            }

            await axios
              .post(`https://api.line.me/v2/bot/message/push`, data3, {
                headers: {
                  'Authorization': "Bearer " + linetoken,
                },
              })
              .then((response) => {
              })
              .catch(async (err) => {
                console.log(`err send line approver: ${err}`);
              });
          }
          catch (err) {
            console.log(`err catch send line approver: ${err}`);
          }

          return false;
        }

        let updatevalueArr = [
          `[HOUR] = '${Number(result.recordset[0].HOUR)}'`,
          `[DAY] = '${Number(result.recordset[0].DAY)}'`,
        ]

        pool = await new dbQuery().connect();
        sql = `UPDATE [LEAVE_TRANSACTION_QTY] SET ${updatevalueArr} WHERE id = '${result.recordset[0].id}'`;
        result = await pool.query(sql);
      }
      else {
        if (dataLeaveTypeDetail.QTY < day) {
          try {
            var data3 = {
              "to": approver,
              "messages": [
                {
                  "type": "text",
                  "text": `เกิดข้อผิดพลาดการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE}\nเนื่องจาก: จำนวนวันไม่เพียงพอ`
                }
              ]
            }

            await axios
              .post(`https://api.line.me/v2/bot/message/push`, data3, {
                headers: {
                  'Authorization': "Bearer " + linetoken,
                },
              })
              .then((response) => {
              })
              .catch(async (err) => {
                console.log(`err send line approver: ${err}`);
              });
          }
          catch (err) {
            console.log(`err catch send line approver: ${err}`);
          }

          return false;
        }

        let columnQTYArr = [
          "[FK_USER_ID]",
          "[FK_LEAVE_TYPE_ID]",
          "[YEAR]",
          "[HOUR]",
          "[DAY]"
        ]

        let valueQTYArr = [
          `'${body.FK_USER_ID}'`,
          `'${body.LEAVE_TYPE}'`,
          `'${moment(new Date()).format('YYYY')}'`,
          `'${timesplit}'`,
          `'${day}'`,
        ]

        pool = await new dbQuery().connect();
        sql = `INSERT INTO [LEAVE_TRANSACTION_QTY] (${columnQTYArr}) OUTPUT Inserted.id VALUES (${valueQTYArr})`;
        result = await pool.query(sql);
      }
    }
    catch (err) {
      console.log(err);
    }

    try {
      var data = {
        "to": approver,
        "messages": [
          {
            "type": "text",
            "text": `คุณได้อนุมัติข้อมูลการลา\nเลขที่: ${dataLeaveTransaction.LEAVE_CODE} แล้ว`
          }
        ]
      }

      await axios
        .post(`https://api.line.me/v2/bot/message/push`, data, {
          headers: {
            'Authorization': "Bearer " + linetoken,
          },
        })
        .then((response) => {
        })
        .catch(async (err) => {
          console.log(`err send line approver: ${err}`);
        });
    }
    catch (err) {
      console.log(`err catch send line approver: ${err}`);
    }

    if (dataLeaveTransaction.IS_RETIRE) {
      sql = `UPDATE [USER] SET LAST_WORK = '${moment(dataLeaveTransaction.LEAVE_TO_DATE).format('YYYY-MM-DD')}' WHERE id = '${dataUser.id}'`;
      result = await pool.query(sql);
    }

    let updatevalueArr = [
      `[STATUS] = '2'`,
      `[PRIMARY_APPROVE] = '1'`,
      `[PRIMARY_APPROVED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
      // `[UPDATED_BY] = '${req.user.id}'`,
      `[UPDATED_DATE] = '${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}'`,
    ]

    pool = await new dbQuery().connect();
    sql = `UPDATE [LEAVE_TRANSACTION] SET ${updatevalueArr} WHERE id = '${leavetransactionid}'`;
    result = await pool.query(sql);

    await sendApproveToEmployee(dataUser, dataLeaveTransaction, linetoken);
    return true;
  }
  else {
    var data = {
      "to": approver,
      "messages": [
        {
          "type": "text",
          "text": `ไม่สามารถบันทึกข้อมูล\nการลาเลขที่: ${dataLeaveTransaction.LEAVE_CODE} ซ้ำได้`
        }
      ]
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
      })
      .catch(async (err) => {
        console.log(`err send line approver: ${err}`);
      });
    return true;
  }
}

async function sendApproveToEmployee(dataUser, dataLeaveTransaction, linetoken) {
  try {
    var data = {};
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
                      // "uri": `${process.env.USERURL}/Register/` + userid
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
                    "text": `${moment(new Date()).format('DD/MM/YYYY')}`,
                    "weight": "bold",
                    "size": "lg",
                    "align": "center"
                  },
                ]
              }
            }
          }
        ]
      }
    }
    else if (dataLeaveTransaction.IS_RETIRE) {
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
                    "text": `วันที่ขอลาออก ${moment(new Date()).format('DD/MM/YYYY')}`,
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
      }
    }
    else {
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
                    "text": `วันที่ขอลาหยุด ${moment(new Date()).format('DD/MM/YYYY')}`,
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
                      // "uri": `${process.env.USERURL}/Register/` + userid
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
    }

    // console.log('linetoken2', linetoken);
    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        return true;
      })
      .catch((err) => {
        // console.log('err sendToEmployee', err);
        return false;
      });
    return false;
  }
  catch (err) {
    console.log('error: ', err);
    return false;
  }
}

async function sendRejectToEmployee(dataUser, dataLeaveTransaction, linetoken) {
  try {
    var data = {
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
                  "text": `เมื่อวันที่ ${moment(new Date()).format('DD/MM/YYYY')}`,
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
    }

    await axios
      .post(`https://api.line.me/v2/bot/message/push`, data, {
        headers: {
          'Authorization': "Bearer " + linetoken,
        },
      })
      .then((response) => {
        return true;
      })
      .catch((err) => {
        console.log('err sendToEmployee', err);
        return false;
      });
    return false;
  }
  catch (err) {
    console.log('error: ', err);
    return false;
  }
}

//ลงทะเบียน
async function register(userid, linetoken) {
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
            // "body": {
            //   "type": "box",
            //   "layout": "vertical",
            //   "contents": [
            //     {
            //       "type": "text",
            //       "text": "ลิงค์สำหรับการลงทะเบียน",
            //       "weight": "bold",
            //       "size": "lg",
            //       "align": "center"
            //     },
            //   ]
            // },
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
        let pool = await new dbQuery().connect();
        var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
        const result = await pool.query(sql);
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += " ERROR catch: " + err + "| ";
  }
  let pool = await new dbQuery().connect();
  var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
  const result = await pool.query(sql);
  return null
}

//ข้อมูลการลา
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
            // "body": {
            //   "type": "box",
            //   "layout": "vertical",
            //   "contents": [
            //     {
            //       "type": "text",
            //       "text": "ลิงค์สำหรับการลงทะเบียน",
            //       "weight": "bold",
            //       "size": "lg",
            //       "align": "center"
            //     },
            //   ]
            // },
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
        let pool = await new dbQuery().connect();
        var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
        const result = await pool.query(sql);
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += " ERROR catch: " + err + "| ";
  }
  let pool = await new dbQuery().connect();
  var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
  const result = await pool.query(sql);
  return null
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
            // "body": {
            //   "type": "box",
            //   "layout": "vertical",
            //   "contents": [
            //     {
            //       "type": "text",
            //       "text": "ลิงค์สำหรับการลงทะเบียน",
            //       "weight": "bold",
            //       "size": "lg",
            //       "align": "center"
            //     },
            //   ]
            // },
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
        let pool = await new dbQuery().connect();
        var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
        const result = await pool.query(sql);
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += " ERROR catch: " + err + "| ";
  }
  let pool = await new dbQuery().connect();
  var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
  const result = await pool.query(sql);
  return null
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
            // "body": {
            //   "type": "box",
            //   "layout": "vertical",
            //   "contents": [
            //     {
            //       "type": "text",
            //       "text": "ลิงค์สำหรับการลงทะเบียน",
            //       "weight": "bold",
            //       "size": "lg",
            //       "align": "center"
            //     },
            //   ]
            // },
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
        let pool = await new dbQuery().connect();
        var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
        const result = await pool.query(sql);
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += " ERROR catch: " + err + "| ";
  }
  let pool = await new dbQuery().connect();
  var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
  const result = await pool.query(sql);
  return null
}

//ยกเลิกคำขอ 
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
            // "body": {
            //   "type": "box",
            //   "layout": "vertical",
            //   "contents": [
            //     {
            //       "type": "text",
            //       "text": "ลิงค์สำหรับการลงทะเบียน",
            //       "weight": "bold",
            //       "size": "lg",
            //       "align": "center"
            //     },
            //   ]
            // },
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
                    "label": "ยกเลิกการลา",
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
        let pool = await new dbQuery().connect();
        var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
        const result = await pool.query(sql);
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += " ERROR catch: " + err + "| ";
  }
  let pool = await new dbQuery().connect();
  var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
  const result = await pool.query(sql);
  return null
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
            // "body": {
            //   "type": "box",
            //   "layout": "vertical",
            //   "contents": [
            //     {
            //       "type": "text",
            //       "text": "ลิงค์สำหรับการลงทะเบียน",
            //       "weight": "bold",
            //       "size": "lg",
            //       "align": "center"
            //     },
            //   ]
            // },
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
        let pool = await new dbQuery().connect();
        var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
        const result = await pool.query(sql);
        return;
      });
  }
  catch (err) {
    console.log(`err2: ${err}`);
    tracktxt += " ERROR catch: " + err + "| ";
  }
  let pool = await new dbQuery().connect();
  var sql = `INSERT INTO [WEBHOOK_LINE] (JSONDATA) VALUES ('${tracktxt}')`;
  const result = await pool.query(sql);
  return null
}



