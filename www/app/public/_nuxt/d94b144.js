(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{402:function(t,e,d){var content=d(453);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,d(132).default)("9df7c602",content,!0,{sourceMap:!1})},452:function(t,e,d){"use strict";d(402)},453:function(t,e,d){var o=d(131)((function(i){return i[1]}));o.push([t.i,'.upload-container[data-v-27dade10]{border-radius:10px;margin:0 auto;padding:20px;width:100%}h2[data-v-27dade10]{color:#333;font-family:"Arial",sans-serif}input[type=file][data-v-27dade10]{margin:10px 0}button[data-v-27dade10]{background-color:#4caf50;border:none;color:#fff;cursor:pointer;margin-top:10px;padding:10px 15px}button[data-v-27dade10]:hover{background-color:#45a049}.status-message[data-v-27dade10]{color:#d9534f;font-size:14px;margin-top:10px}.leave-container[data-v-27dade10]{margin-top:20px}.leave-item[data-v-27dade10]{align-items:center;display:flex;margin-bottom:10px}.leave-description[data-v-27dade10],.leave-label[data-v-27dade10]{font-weight:700;margin-left:20px;margin-right:20px;width:120px}.leave-input[data-v-27dade10]{border:1px solid #ccc;border-radius:4px;margin:0 10px;padding:5px;width:60px}',""]),o.locals={},t.exports=o},485:function(t,e,d){"use strict";d.r(e);var o=d(107),l=d.n(o),n={data:function(){return{leaveData:[{label:"ลาป่วย",days:30,description:"ลาราชการทหาร",extraDays:"-"},{label:"ลากิจ",days:6,description:"ลาอุปสมบท",extraDays:"-"},{label:"ลากิจ(พิเศษ)",days:"-",description:"ลาหยุดพักผ่อนประจำปี",extraDays:6},{label:"ลาคลอด",days:98,description:"ลาไม่รับค่าจ้าง",extraDays:"-"}],selectedFile:null,uploadStatus:""}},methods:{handleFileUpload:function(t){this.selectedFile=t.target.files[0]},uploadFile:function(){var t=this;if(this.selectedFile){var e=new FormData;e.append("files",this.selectedFile);var d={method:"post",url:"http://localhost:3002/master/migrate-data",headers:{"Content-Type":"multipart/form-data"},data:e};l.a.request(d).then((function(e){t.uploadStatus="อัปโหลดไฟล์สำเร็จ!",console.log(e.data)})).catch((function(e){t.uploadStatus="การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่",console.error(e)}))}else this.uploadStatus="กรุณาเลือกไฟล์ก่อน"}}},r=(d(452),d(88)),component=Object(r.a)(n,(function(){var t=this,e=t._self._c;return e("div",{staticClass:"upload-container"},[e("h2",[t._v("Upload File")]),t._v(" "),e("input",{attrs:{type:"file"},on:{change:t.handleFileUpload}}),t._v(" "),e("button",{on:{click:t.uploadFile}},[t._v("Upload")]),t._v(" "),t.uploadStatus?e("div",{staticClass:"status-message"},[t._v(t._s(t.uploadStatus))]):t._e()])}),[],!1,null,"27dade10",null);e.default=component.exports}}]);