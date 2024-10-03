(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{408:function(e,t,l){var content=l(466);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,l(132).default)("237b4ef3",content,!0,{sourceMap:!1})},465:function(e,t,l){"use strict";l(408)},466:function(e,t,l){var r=l(131)((function(i){return i[1]}));r.push([e.i,".leave-form[data-v-69475aac]{padding:20px}.leave-credits[data-v-69475aac]{display:flex;justify-content:space-between;margin-bottom:20px}.leave-credit[data-v-69475aac]{border-radius:10px;color:#fff;padding:10px;text-align:center;width:100px}.sick-leave[data-v-69475aac]{background-color:#ff8a80}.business-leave[data-v-69475aac]{background-color:#ffeb3b}.vacation-leave[data-v-69475aac]{background-color:#82b1ff}.leave-request-form[data-v-69475aac]{display:flex;flex-direction:column}.leave-request-form label[data-v-69475aac]{margin-bottom:5px;margin-top:10px}.leave-request-form input[data-v-69475aac],.leave-request-form select[data-v-69475aac]{border:1px solid #ccc;border-radius:5px;margin-bottom:10px;padding:10px}button[data-v-69475aac]{background-color:#6200ea;border:none;border-radius:5px;color:#fff;cursor:pointer;font-size:16px;padding:10px}button[data-v-69475aac]:hover{background-color:#3700b3}",""]),r.locals={},e.exports=r},489:function(e,t,l){"use strict";l.r(t);l(5),l(23),l(4),l(8);var r={props:{userData:{type:Object,required:!0}},data:function(){return{leaveCredits:[{label:"สิทธิ์ลาป่วย",remaining:this.userData.totalSickLeave,total:this.userData.remainingSickLeave,class:"sick-leave"},{label:"สิทธิ์ลากิจ",remaining:this.userData.totalPersonalLeave,total:this.userData.remainingPersonalLeave,class:"business-leave"},{label:"สิทธิ์ลาพักร้อน",remaining:this.userData.remainingVacationLeave,total:this.userData.grantedVacationLeave,class:"vacation-leave"}],leaveTypes:[{value:"ลาป่วย",label:"ลาป่วย"},{value:"ลากิจ",label:"ลากิจ"},{value:"ลาพักร้อน",label:"ลาพักร้อน"},{value:"ลากิจพิเศษ",label:"ลากิจพิเศษ"},{value:"อุปสมบท",label:"อุปสมบท"},{value:"ลาคลอด",label:"ลาคลอด"},{value:"ลาไม่รับค่าจ้าง",label:"ลาไม่รับค่าจ้าง"},{value:"ลาหยุดพักผ่อนประจำปี",label:"ลาหยุดพักผ่อนประจำปี"}],selectedLeaveType:"",leaveReason:"",startDate:"",endDate:"",startTime:"",endTime:""}},methods:{submitLeaveRequest:function(){var e=this,t=l(107),r={method:"post",maxBodyLength:1/0,url:"http://localhost:3002/leave/createLeave",headers:{"Content-Type":"application/json"},data:JSON.stringify({type:this.selectedLeaveType,reason:this.leaveReason,startDate:this.startDate,endDate:this.endDate,startTime:this.startTime,endTime:this.endTime,sendDate:new Date,lineId:localStorage.getItem("profile")?JSON.parse(localStorage.getItem("profile")).userId:null,status:"รออนุมัติ",reasonText:" "})};t.request(r).then((function(l){var r={method:"post",maxBodyLength:1/0,url:"http://localhost:3002/lineApi/sendImage/"+l.data.lineId,headers:{"Content-Type":"application/json"},data:JSON.stringify({message:"รออนุมัติ"})};t.request(r).then((function(t){alert("บันทึกสำเร็จ"),e.$router.push("/")})).catch((function(e){console.log(e)}))})).catch((function(e){console.log(e)}))}}},n=(l(465),l(88)),component=Object(n.a)(r,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"leave-form"},[t("div",{staticClass:"leave-credits"},e._l(e.leaveCredits,(function(l,r){return t("div",{key:r,class:["leave-credit",l.class]},[t("div",[e._v("วัน")]),e._v(" "),t("div",[e._v(e._s(l.remaining)+"/"+e._s(l.total))]),e._v(" "),t("div",[e._v(e._s(l.label))])])})),0),e._v(" "),t("form",{staticClass:"leave-request-form",on:{submit:function(t){return t.preventDefault(),e.submitLeaveRequest.apply(null,arguments)}}},[t("label",{attrs:{for:"leave-type"}},[e._v("ประเภทการลา")]),e._v(" "),t("select",{directives:[{name:"model",rawName:"v-model",value:e.selectedLeaveType,expression:"selectedLeaveType"}],attrs:{id:"leave-type"},on:{change:function(t){var l=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){return"_value"in e?e._value:e.value}));e.selectedLeaveType=t.target.multiple?l:l[0]}}},[t("option",{attrs:{value:"",disabled:"",selected:""}},[e._v("เลือกประเภทการลา")]),e._v(" "),e._l(e.leaveTypes,(function(l,r){return t("option",{key:r,domProps:{value:l.value}},[e._v("\n        "+e._s(l.label)+"\n      ")])}))],2),e._v(" "),t("label",{attrs:{for:"leave-reason"}},[e._v("เหตุผลการลา")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.leaveReason,expression:"leaveReason"}],attrs:{type:"text",id:"leave-reason",placeholder:"ระบุเหตุผลการลา"},domProps:{value:e.leaveReason},on:{input:function(t){t.target.composing||(e.leaveReason=t.target.value)}}}),e._v(" "),t("label",{attrs:{for:"start-date"}},[e._v("วันที่ลางานวันแรก")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.startDate,expression:"startDate"}],attrs:{type:"date",id:"start-date"},domProps:{value:e.startDate},on:{input:function(t){t.target.composing||(e.startDate=t.target.value)}}}),e._v(" "),t("label",{attrs:{for:"end-date"}},[e._v("วันที่ลางานวันสุดท้าย")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.endDate,expression:"endDate"}],attrs:{type:"date",id:"end-date"},domProps:{value:e.endDate},on:{input:function(t){t.target.composing||(e.endDate=t.target.value)}}}),e._v(" "),t("label",{attrs:{for:"start-time"}},[e._v("เริ่มเวลา")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.startTime,expression:"startTime"}],attrs:{type:"time",id:"start-time"},domProps:{value:e.startTime},on:{input:function(t){t.target.composing||(e.startTime=t.target.value)}}}),e._v(" "),t("label",{attrs:{for:"end-time"}},[e._v("เวลาสิ้นสุด")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.endTime,expression:"endTime"}],attrs:{type:"time",id:"end-time"},domProps:{value:e.endTime},on:{input:function(t){t.target.composing||(e.endTime=t.target.value)}}}),e._v(" "),t("button",{attrs:{type:"submit"}},[e._v("ส่งคำขอลาการลา")])])])}),[],!1,null,"69475aac",null);t.default=component.exports}}]);