(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{386:function(t,e,r){var content=r(403);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,r(131).default)("5d475735",content,!0,{sourceMap:!1})},402:function(t,e,r){"use strict";r(386)},403:function(t,e,r){var o=r(130)((function(i){return i[1]}));o.push([t.i,".request-list[data-v-7457c802]{padding:20px}.request-item[data-v-7457c802]{align-items:center;border-bottom:1px solid #eee;display:flex;padding:10px 0}.request-icon[data-v-7457c802]{margin-right:10px}.icon-number[data-v-7457c802]{align-items:center;background-color:red;border-radius:50%;color:#fff;display:flex;font-size:16px;font-weight:700;height:30px;justify-content:center;width:30px}.request-details[data-v-7457c802]{flex-grow:1}.request-name[data-v-7457c802]{font-weight:700;margin-bottom:5px}.request-date-time[data-v-7457c802]{color:#999;font-size:14px}.request-reason[data-v-7457c802]{font-size:14px;margin-right:20px}.details-button[data-v-7457c802]{background-color:#ffeb3b;border:none;border-radius:5px;cursor:pointer;font-size:14px;padding:5px 10px}.details-button[data-v-7457c802]:hover{background-color:#fdd835}.modal[data-v-7457c802]{align-items:center;background-color:rgba(0,0,0,.4);display:flex;height:100%;justify-content:center;left:0;overflow:auto;position:fixed;top:0;width:100%;z-index:1}.modal-content[data-v-7457c802]{background-color:#fefefe;border:1px solid #888;border-radius:10px;max-width:600px;padding:20px;width:80%}.close[data-v-7457c802]{color:#aaa;float:right;font-size:28px;font-weight:700}.close[data-v-7457c802]:focus,.close[data-v-7457c802]:hover{color:#000;cursor:pointer;-webkit-text-decoration:none;text-decoration:none}.approval[data-v-7457c802]{display:flex;margin-top:10px}.approval label[data-v-7457c802]{margin-right:10px}textarea[data-v-7457c802]{border:1px solid #ccc;border-radius:5px;margin-top:10px;padding:10px;width:100%}.submit-button[data-v-7457c802]{background-color:#6200ea;border:none;border-radius:5px;color:#fff;cursor:pointer;font-size:16px;margin-top:20px;padding:10px;width:100%}.submit-button[data-v-7457c802]:hover{background-color:#3700b3}",""]),o.locals={},t.exports=o},418:function(t,e,r){"use strict";r.r(e);r(36);var o={data:function(){return{requests:[{id:1,name:"นาย กานต์ธนิต ทรัพย์เขต",date:"16 ส.ค 67",time:"06:35 น.",reason:"ลาป่วย / เป็นไข้หวัดใหญ่"},{id:1,name:"นาย กานต์ธนิต ทรัพย์เขต",date:"16 ส.ค 67",time:"08:52 น.",reason:"ลากิจ / พาแมวไปทำหมัน"}],selectedRequest:null}},methods:{openModal:function(t){this.selectedRequest=t},closeModal:function(){this.selectedRequest=null}}},n=(r(402),r(87)),component=Object(n.a)(o,(function(){var t=this,e=t._self._c;return e("div",{staticClass:"request-list"},[e("h3",[t._v("รายการคำขอทั้งหมด")]),t._v(" "),t._l(t.requests,(function(r,o){return e("div",{key:o,staticClass:"request-item"},[e("div",{staticClass:"request-icon"},[e("div",{staticClass:"icon-number"},[t._v(t._s(r.id))])]),t._v(" "),e("div",{staticClass:"request-details"},[e("div",{staticClass:"request-name"},[t._v(t._s(r.name))]),t._v(" "),e("div",{staticClass:"request-date-time"},[t._v(t._s(r.date)+" | "+t._s(r.time))])]),t._v(" "),e("div",{staticClass:"request-reason"},[t._v(t._s(r.reason))]),t._v(" "),e("button",{staticClass:"details-button",on:{click:function(e){return t.openModal(r)}}},[t._v("รายละเอียด")])])})),t._v(" "),t.selectedRequest?e("div",{staticClass:"modal"},[e("div",{staticClass:"modal-content"},[e("span",{staticClass:"close",on:{click:t.closeModal}},[t._v("×")]),t._v(" "),e("h3",[t._v("รายละเอียดคำขอ")]),t._v(" "),e("p",[e("strong",[t._v("ชื่อ-นามสกุล:")]),t._v(" "+t._s(t.selectedRequest.name))]),t._v(" "),t._m(0),t._v(" "),t._m(1),t._v(" "),t._m(2),t._v(" "),t._m(3),t._v(" "),t._m(4),t._v(" "),t._m(5),t._v(" "),t._m(6),t._v(" "),t._m(7),t._v(" "),e("p",[e("strong",[t._v("ประเภทการลา/เหตุผลการลา:")]),t._v(" "+t._s(t.selectedRequest.reason))]),t._v(" "),t._m(8),t._v(" "),t._m(9),t._v(" "),t._m(10),t._v(" "),e("label",{attrs:{for:"remark"}},[t._v("หมายเหตุ:")]),t._v(" "),e("textarea",{attrs:{id:"remark",rows:"4"}}),t._v(" "),e("button",{staticClass:"submit-button"},[t._v("ยืนยัน")])])]):t._e()],2)}),[function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("รหัสพนักงาน:")]),t._v(" WM64007H")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("ตำแหน่ง:")]),t._v(" Human Resource Officer")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("สังกัด:")]),t._v(" Workmotion")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("ประเภทพนักงาน:")]),t._v(" พนักงานรายเดือน")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("ฝ่าย:")]),t._v(" Human Resource")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("สถานที่ปฏิบัติงาน:")]),t._v(" BKK")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("อายุงาน:")]),t._v(" 000-000000")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("เบอร์โทรศัพท์:")]),t._v(" 000-00000000")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("วัน/เดือน/ปี ที่ต้องการลา:")]),t._v(" XX/XX/XXXX - XX/XX/XXXX")])},function(){var t=this,e=t._self._c;return e("p",[e("strong",[t._v("เวลา ที่ต้องการลา:")]),t._v(" 22:00 - 23:00")])},function(){var t=this,e=t._self._c;return e("div",{staticClass:"approval"},[e("label",[e("input",{attrs:{type:"radio",name:"approval",value:"approved"}}),t._v(" อนุมัติ")]),t._v(" "),e("label",[e("input",{attrs:{type:"radio",name:"approval",value:"not-approved"}}),t._v(" ไม่อนุมัติ")])])}],!1,null,"7457c802",null);e.default=component.exports}}]);