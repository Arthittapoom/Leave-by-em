(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{393:function(e,t,l){var content=l(416);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,l(131).default)("cb0df9ee",content,!0,{sourceMap:!1})},415:function(e,t,l){"use strict";l(393)},416:function(e,t,l){var n=l(130)((function(i){return i[1]}));n.push([e.i,'.upload-container[data-v-8c45f332]{border-radius:10px;margin:0 auto;padding:20px;width:100%}h2[data-v-8c45f332]{color:#333;font-family:"Arial",sans-serif}input[type=file][data-v-8c45f332]{margin:10px 0}button[data-v-8c45f332]{background-color:#4caf50;border:none;color:#fff;cursor:pointer;margin-top:10px;padding:10px 15px}button[data-v-8c45f332]:hover{background-color:#45a049}.status-message[data-v-8c45f332]{color:#d9534f;font-size:14px;margin-top:10px}.leave-container[data-v-8c45f332]{margin-top:20px}.leave-item[data-v-8c45f332]{align-items:center;display:flex;margin-bottom:10px}.leave-description[data-v-8c45f332],.leave-label[data-v-8c45f332]{font-weight:700;margin-left:20px;margin-right:20px;width:120px}.leave-input[data-v-8c45f332]{border:1px solid #ccc;border-radius:4px;margin:0 10px;padding:5px;width:60px}',""]),n.locals={},e.exports=n},448:function(e,t,l){"use strict";l.r(t);l(7),l(77);var n=l(106),o=l.n(n),r={data:function(){return{leaveData:[{label:"ลาป่วย",days:30,description:"ลาราชการทหาร",extraDays:"-"},{label:"ลากิจ",days:6,description:"ลาอุปสมบท",extraDays:"-"},{label:"ลากิจ(พิเศษ)",days:"-",description:"ลาหยุดพักผ่อนประจำปี",extraDays:6},{label:"ลาคลอด",days:98,description:"ลาไม่รับค่าจ้าง",extraDays:"-"}],selectedFile:null,uploadStatus:""}},methods:{handleFileUpload:function(e){this.selectedFile=e.target.files[0]},uploadFile:function(){var e=this;if(this.selectedFile){var t=new FormData;t.append("files",this.selectedFile);var l={method:"post",url:"http://localhost:3002/master/migrate-data",headers:{"Content-Type":"multipart/form-data"},data:t};o.a.request(l).then((function(t){e.uploadStatus="อัปโหลดไฟล์สำเร็จ!",console.log(t.data)})).catch((function(t){e.uploadStatus="การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่",console.error(t)}))}else this.uploadStatus="กรุณาเลือกไฟล์ก่อน"}}},d=(l(415),l(87)),component=Object(d.a)(r,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"upload-container"},[t("h2",[e._v("Upload File")]),e._v(" "),t("input",{attrs:{type:"file"},on:{change:e.handleFileUpload}}),e._v(" "),t("button",{on:{click:e.uploadFile}},[e._v("Upload")]),e._v(" "),e.uploadStatus?t("div",{staticClass:"status-message"},[e._v(e._s(e.uploadStatus))]):e._e(),e._v(" "),t("div",{staticClass:"leave-container"},[t("h3",[e._v("Leave Details")]),e._v(" "),e._l(e.leaveData,(function(l,n){return t("div",{key:n,staticClass:"leave-item"},[t("span",{staticClass:"leave-label"},[e._v(e._s(l.label)+":")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:l.days,expression:"leaveType.days"}],staticClass:"leave-input",attrs:{type:"number"},domProps:{value:l.days},on:{input:function(t){t.target.composing||e.$set(l,"days",t.target.value)}}}),e._v(" "),t("span",[e._v("วัน/ปี")]),e._v(" "),t("span",{staticClass:"leave-description"},[e._v(e._s(l.description)+":")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:l.extraDays,expression:"leaveType.extraDays"}],staticClass:"leave-input",attrs:{type:"number"},domProps:{value:l.extraDays},on:{input:function(t){t.target.composing||e.$set(l,"extraDays",t.target.value)}}}),e._v(" "),t("span",[e._v("วัน/ปี")])])}))],2)])}),[],!1,null,"8c45f332",null);t.default=component.exports}}]);