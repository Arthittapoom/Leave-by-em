(window.webpackJsonp=window.webpackJsonp||[]).push([[1,16,17],{382:function(e,t,r){var content=r(391);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,r(131).default)("1501cbe4",content,!0,{sourceMap:!1})},390:function(e,t,r){"use strict";r(382)},391:function(e,t,r){var o=r(130)((function(i){return i[1]}));o.push([e.i,".user-details-container[data-v-62d519fc]{font-family:Arial,sans-serif;padding:20px}.user-info[data-v-62d519fc]{align-items:flex-start;display:flex;justify-content:space-between;margin-bottom:20px}.user-photo-section[data-v-62d519fc]{text-align:center}.user-photo[data-v-62d519fc]{background-color:#8b0000;border-radius:50%;height:120px;margin-bottom:10px;width:120px}.user-photo p[data-v-62d519fc]{font-size:16px;margin:0}.user-data-section[data-v-62d519fc]{display:flex;flex-wrap:wrap;justify-content:space-between;width:75%}.user-data[data-v-62d519fc]{margin-bottom:15px;width:48%}label[data-v-62d519fc]{display:block;font-size:14px;margin-bottom:5px}.data-box[data-v-62d519fc]{background-color:#e0e0e0;border-radius:5px;font-size:16px;height:40px;padding:10px}.leave-history-section[data-v-62d519fc]{margin-top:20px}table[data-v-62d519fc]{border-collapse:collapse;font-size:14px;width:100%}td[data-v-62d519fc],th[data-v-62d519fc]{border-bottom:1px solid #ddd;padding:10px;text-align:left}th[data-v-62d519fc]{color:#8b0000}.pending[data-v-62d519fc]{background-color:#e0e0e0;color:#555}.approved[data-v-62d519fc],.pending[data-v-62d519fc]{border-radius:10px;padding:5px 10px}.approved[data-v-62d519fc]{background-color:#c2f0e1;color:#17a789}.rejected[data-v-62d519fc]{background-color:#f9d1d1;border-radius:10px;color:#d9534f;padding:5px 10px}.back-btn[data-v-62d519fc]{background-color:#8b0000;border:none;border-radius:5px;color:#fff;cursor:pointer;margin-top:20px;padding:10px 20px}",""]),o.locals={},e.exports=o},392:function(e,t,r){var content=r(414);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,r(131).default)("5750b010",content,!0,{sourceMap:!1})},404:function(e,t,r){"use strict";r.r(t);var o={data:function(){return{leaveHistory:[{type:"ลาป่วย",startDate:"xx/xx/xx",endDate:"xx/xx/xx",reason:"อื่นๆ",status:"อนุมัติ"},{type:"ลากิจ",startDate:"xx/xx/xx",endDate:"xx/xx/xx",reason:"อื่นๆ",status:"ไม่อนุมัติ"}]}},props:["user"],methods:{goBack:function(){this.$emit("go-back-history")},getStatusClass:function(e){return"รออนุมัติ"===e?"pending":"อนุมัติ"===e?"approved":"ไม่อนุมัติ"===e?"rejected":void 0}}},n=(r(390),r(87)),component=Object(n.a)(o,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"user-details-container"},[t("div",{staticClass:"user-info"},[t("div",{staticClass:"user-photo-section"},[t("div",{staticClass:"user-photo"}),e._v(" "),t("p",[e._v("รหัสพนักงาน "+e._s(e.user.employeeId))])]),e._v(" "),t("div",{staticClass:"user-data-section"},[t("div",{staticClass:"user-data"},[t("label",[e._v("ชื่อผู้ใช้งาน")]),e._v(" "),t("div",{staticClass:"data-box"},[e._v(e._s(e.user.username))])]),e._v(" "),t("div",{staticClass:"user-data"},[t("label",[e._v("ชื่อ-นามสกุล")]),e._v(" "),t("div",{staticClass:"data-box"},[e._v(e._s(e.user.fullName))])]),e._v(" "),t("div",{staticClass:"user-data"},[t("label",[e._v("เบอร์โทร")]),e._v(" "),t("div",{staticClass:"data-box"},[e._v(e._s(e.user.phone))])]),e._v(" "),t("div",{staticClass:"user-data"},[t("label",[e._v("ตำแหน่ง")]),e._v(" "),t("div",{staticClass:"data-box"},[e._v(e._s(e.user.position))])]),e._v(" "),t("div",{staticClass:"user-data"},[t("label",[e._v("อีเมล")]),e._v(" "),t("div",{staticClass:"data-box"},[e._v(e._s(e.user.email))])]),e._v(" "),t("div",{staticClass:"user-data"},[t("label",[e._v("แผนก")]),e._v(" "),t("div",{staticClass:"data-box"},[e._v(e._s(e.user.department))])])])]),e._v(" "),t("div",{staticClass:"leave-history-section"},[t("table",[e._m(0),e._v(" "),t("tbody",e._l(e.leaveHistory,(function(r,o){return t("tr",{key:o},[t("td",[e._v(e._s(o+1))]),e._v(" "),t("td",[e._v(e._s(r.type))]),e._v(" "),t("td",[e._v(e._s(r.startDate))]),e._v(" "),t("td",[e._v(e._s(r.endDate))]),e._v(" "),t("td",[e._v(e._s(r.reason))]),e._v(" "),t("td",[t("span",{class:e.getStatusClass(r.status)},[e._v("\n              "+e._s(r.status)+"\n            ")])])])})),0)])]),e._v(" "),t("button",{staticClass:"back-btn",on:{click:e.goBack}},[e._v("ย้อนกลับ")])])}),[function(){var e=this,t=e._self._c;return t("thead",[t("tr",[t("th",[e._v("ลำดับ")]),e._v(" "),t("th",[e._v("ประเภทการลา")]),e._v(" "),t("th",[e._v("วันที่ลาวันแรก")]),e._v(" "),t("th",[e._v("วันที่ลาวันสุดท้าย")]),e._v(" "),t("th",[e._v("เหตุผลที่ลา")]),e._v(" "),t("th",[e._v("สถานะคำขอ")])])])}],!1,null,"62d519fc",null);t.default=component.exports},413:function(e,t,r){"use strict";r(392)},414:function(e,t,r){var o=r(130)((function(i){return i[1]}));o.push([e.i,".profile-container[data-v-5416e959]{display:flex;justify-content:center;padding:20px}.profile-pic[data-v-5416e959]{align-items:center;display:flex;flex-direction:column;margin-right:50px}.circle[data-v-5416e959]{border-radius:50%;height:120px;margin-bottom:10px;width:120px}.circle[data-v-5416e959],.view-history[data-v-5416e959]{background-color:#a33331}.view-history[data-v-5416e959]{border:none;border-radius:5px;color:#fff;cursor:pointer;margin-top:10px;padding:10px}.form[data-v-5416e959]{width:60%}.form-row[data-v-5416e959]{display:flex;justify-content:space-between;margin-bottom:15px}.input-group[data-v-5416e959]{flex:1;margin-right:15px}.input-group[data-v-5416e959]:last-child{margin-right:0}label[data-v-5416e959]{display:block;margin-bottom:5px}input[data-v-5416e959],textarea[data-v-5416e959]{background-color:#f5f5f5;border:1px solid #ccc;border-radius:5px;color:#333;padding:10px;width:100%}textarea[data-v-5416e959]{height:100px;resize:none}.radio-group[data-v-5416e959]{background-color:#f9f9f9;border-radius:5px;display:flex;justify-content:space-between;padding:10px}.radio-option[data-v-5416e959]{align-items:center;display:flex;flex:1}.buttons[data-v-5416e959]{display:flex;justify-content:flex-end;margin-top:20px}.cancel-btn[data-v-5416e959]{background-color:#ccc;color:#000;margin-right:10px}.cancel-btn[data-v-5416e959],.save-btn[data-v-5416e959]{border:none;border-radius:5px;cursor:pointer;padding:10px 20px}.save-btn[data-v-5416e959]{background-color:#5cbc97;color:#fff}.scrollable-content[data-v-5416e959]{height:85vh;overflow-x:hidden;overflow-y:scroll;padding:10px;width:100%}.scrollable-content[data-v-5416e959]::-webkit-scrollbar{width:8px}.scrollable-content[data-v-5416e959]::-webkit-scrollbar-thumb{background-color:#fff;border-radius:4px}.scrollable-content[data-v-5416e959]::-webkit-scrollbar-thumb:hover{background-color:#fff}",""]),o.locals={},e.exports=o},438:function(e,t,r){var content=r(457);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,r(131).default)("62cbaa4e",content,!0,{sourceMap:!1})},447:function(e,t,r){"use strict";r.r(t);var o={components:{LeaveHistory:r(404).default},data:function(){return{history:!1}},props:["user"],methods:{viewHistory:function(){this.history=!0},goBack:function(){this.$emit("go-back")},goBackHistory:function(){this.history=!1},save:function(){this.$emit("save",this.user)}}},n=(r(413),r(87)),component=Object(n.a)(o,(function(){var e=this,t=e._self._c;return t("div",[!0===e.history?t("LeaveHistory",{attrs:{user:e.user},on:{"go-back-history":e.goBackHistory}}):e._e(),e._v(" "),!1===e.history?t("div",{staticClass:"profile-container scrollable-content"},[t("div",{staticClass:"profile-pic"},[t("div",{staticClass:"circle"}),e._v(" "),t("p",[e._v("รหัสพนักงาน "+e._s(e.user.employeeId))]),e._v(" "),t("button",{staticClass:"view-history",on:{click:function(t){return e.viewHistory(e.user)}}},[e._v("ดูประวัติการลางาน")])]),e._v(" "),t("div",{staticClass:"form"},[t("div",{staticClass:"form-row"},[t("div",{staticClass:"input-group"},[t("label",[e._v("ชื่อผู้ใช้งาน")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.username,expression:"user.username"}],attrs:{type:"text",disabled:""},domProps:{value:e.user.username},on:{input:function(t){t.target.composing||e.$set(e.user,"username",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"input-group"},[t("label",[e._v("ตำแหน่ง")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.position,expression:"user.position"}],attrs:{type:"text",disabled:""},domProps:{value:e.user.position},on:{input:function(t){t.target.composing||e.$set(e.user,"position",t.target.value)}}})])]),e._v(" "),t("div",{staticClass:"form-row"},[t("div",{staticClass:"input-group"},[t("label",[e._v("ชื่อ - นามสกุล")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.fullName,expression:"user.fullName"}],attrs:{type:"text",disabled:""},domProps:{value:e.user.fullName},on:{input:function(t){t.target.composing||e.$set(e.user,"fullName",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"input-group"},[t("label",[e._v("อีเมล")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.email,expression:"user.email"}],attrs:{type:"email",disabled:""},domProps:{value:e.user.email},on:{input:function(t){t.target.composing||e.$set(e.user,"email",t.target.value)}}})])]),e._v(" "),t("div",{staticClass:"form-row"},[t("div",{staticClass:"input-group"},[t("label",[e._v("เบอร์โทร")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.phone,expression:"user.phone"}],attrs:{type:"text",disabled:""},domProps:{value:e.user.phone},on:{input:function(t){t.target.composing||e.$set(e.user,"phone",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"input-group"},[t("label",[e._v("แผนก")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.department,expression:"user.department"}],attrs:{type:"text",disabled:""},domProps:{value:e.user.department},on:{input:function(t){t.target.composing||e.$set(e.user,"department",t.target.value)}}})])]),e._v(" "),t("div",{staticClass:"form-row"},[t("div",{staticClass:"input-group"},[t("label",[e._v("ประเภทการลา")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.leaveType,expression:"user.leaveType"}],attrs:{type:"text",disabled:""},domProps:{value:e.user.leaveType},on:{input:function(t){t.target.composing||e.$set(e.user,"leaveType",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"input-group"},[t("label",[e._v("เหตุผลการลา")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.leaveReason,expression:"user.leaveReason"}],attrs:{type:"text",disabled:""},domProps:{value:e.user.leaveReason},on:{input:function(t){t.target.composing||e.$set(e.user,"leaveReason",t.target.value)}}})])]),e._v(" "),t("div",{staticClass:"form-row"},[t("label",[e._v("สถานะคำขอ")]),e._v(" "),t("div",{staticClass:"radio-group"},[t("label",{staticClass:"radio-option"},[t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.status,expression:"user.status"}],attrs:{type:"radio",value:"อนุมัติ"},domProps:{checked:e._q(e.user.status,"อนุมัติ")},on:{change:function(t){return e.$set(e.user,"status","อนุมัติ")}}}),e._v(" อนุมัติ\n            ")]),e._v(" "),t("label",{staticClass:"radio-option"},[t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.status,expression:"user.status"}],attrs:{type:"radio",value:"ไม่อนุมัติ"},domProps:{checked:e._q(e.user.status,"ไม่อนุมัติ")},on:{change:function(t){return e.$set(e.user,"status","ไม่อนุมัติ")}}}),e._v(" ไม่อนุมัติ\n            ")])])]),e._v(" "),t("div",{staticClass:"form-row"},[t("label",[e._v("เหตุผล *")]),e._v(" "),t("textarea",{directives:[{name:"model",rawName:"v-model",value:e.user.reasonText,expression:"user.reasonText"}],attrs:{disabled:""},domProps:{value:e.user.reasonText},on:{input:function(t){t.target.composing||e.$set(e.user,"reasonText",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"form-row buttons"},[t("button",{staticClass:"cancel-btn",on:{click:e.goBack}},[e._v("ยกเลิก")]),e._v(" "),t("button",{staticClass:"save-btn",on:{click:e.save}},[e._v("บันทึก")])])])]):e._e()],1)}),[],!1,null,"5416e959",null);t.default=component.exports},456:function(e,t,r){"use strict";r(438)},457:function(e,t,r){var o=r(130)((function(i){return i[1]}));o.push([e.i,'.icon[data-v-3fc288d3]{width:18px}table[data-v-3fc288d3]{border-collapse:collapse;font-family:"Arial",sans-serif;width:100%}td[data-v-3fc288d3],th[data-v-3fc288d3]{padding:10px;text-align:left}th[data-v-3fc288d3]{background-color:#fff;color:#5016a7}tbody tr[data-v-3fc288d3]:hover{background-color:#f4e7fa}.action-buttons[data-v-3fc288d3]{display:flex;gap:5px}button[data-v-3fc288d3]{border:none;border-radius:5px;cursor:pointer;padding:5px 10px}.view-btn[data-v-3fc288d3]{background-color:#5cbcab;color:#fff}span.approved[data-v-3fc288d3]{background-color:#c2f0e1;color:#17a789}span.approved[data-v-3fc288d3],span.rejected[data-v-3fc288d3]{border-radius:20px;padding:5px 10px}span.rejected[data-v-3fc288d3]{background-color:#f9d1d1;color:#d9534f}span.pending[data-v-3fc288d3]{background-color:#e5e5e5;border-radius:20px;color:#555;padding:5px 10px}.filter-search[data-v-3fc288d3]{display:flex;font-family:"Arial",sans-serif;justify-content:space-between;margin-bottom:20px}.filter-search div[data-v-3fc288d3]{align-items:center;display:flex}input[data-v-3fc288d3],select[data-v-3fc288d3]{border:1px solid #ddd;border-radius:5px;font-size:14px;margin-left:10px;padding:5px}input[type=text][data-v-3fc288d3]{width:150px}',""]),o.locals={},e.exports=o},480:function(e,t,r){"use strict";r.r(t);r(5),r(23),r(26),r(4),r(89),r(132);var o={components:{LeaveDetails:r(447).default},data:function(){return{leaveRequests:[{employeeId:"A123456",fullName:"Gracezel Lewalin",position:"Assistant PM",startDate:"xx/xx/xx",startTime:"xx:xx น.",endDate:"xx/xx/xx",endTime:"xx:xx น.",status:"อนุมัติ"},{employeeId:"B123456",fullName:"John Doe",position:"Assistant PM",startDate:"xx/xx/xx",startTime:"xx:xx น.",endDate:"xx/xx/xx",endTime:"xx:xx น.",status:"ไม่อนุมัติ"},{employeeId:"C123456",fullName:"Jane Doe",position:"Assistant PM",startDate:"xx/xx/xx",startTime:"xx:xx น.",endDate:"xx/xx/xx",endTime:"xx:xx น.",status:"รออนุมัติ"}],selectedUser:null,searchQuery:"",statusFilter:"",positionFilter:"",itemsPerPage:10}},computed:{filteredLeaveRequests:function(){var e=this;return this.leaveRequests.filter((function(t){var r=""===e.statusFilter||t.status===e.statusFilter,o=""===e.positionFilter||t.position===e.positionFilter,n=t.fullName.toLowerCase().includes(e.searchQuery.toLowerCase())||t.employeeId.toLowerCase().includes(e.searchQuery.toLowerCase());return r&&o&&n}))}},methods:{viewUser:function(e){this.selectedUser=e},goBack:function(){this.selectedUser=null},saveUser:function(e){console.log("Updated user:",e)},filterTable:function(){}}},n=(r(456),r(87)),component=Object(n.a)(o,(function(){var e=this,t=e._self._c;return t("div",[e.selectedUser?e._e():t("div",{staticClass:"filter-search"},[t("div",[e._v("\n           แสดง \n            "),t("select",{directives:[{name:"model",rawName:"v-model",value:e.itemsPerPage,expression:"itemsPerPage"}],staticClass:"mr-2",on:{change:[function(t){var r=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){return"_value"in e?e._value:e.value}));e.itemsPerPage=t.target.multiple?r:r[0]},e.filterTable]}},e._l([5,10,15,20],(function(r){return t("option",{key:r,domProps:{value:r}},[e._v(e._s(r))])})),0),e._v("\n             รายการ\n        ")]),e._v(" "),t("div",[t("select",{directives:[{name:"model",rawName:"v-model",value:e.statusFilter,expression:"statusFilter"}],on:{change:[function(t){var r=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){return"_value"in e?e._value:e.value}));e.statusFilter=t.target.multiple?r:r[0]},e.filterTable]}},[t("option",{attrs:{value:""}},[e._v("สถานะ")]),e._v(" "),t("option",{attrs:{value:"อนุมัติ"}},[e._v("อนุมัติ")]),e._v(" "),t("option",{attrs:{value:"ไม่อนุมัติ"}},[e._v("ไม่อนุมัติ")]),e._v(" "),t("option",{attrs:{value:"รออนุมัติ"}},[e._v("รออนุมัติ")])]),e._v(" "),t("select",{directives:[{name:"model",rawName:"v-model",value:e.positionFilter,expression:"positionFilter"}],on:{change:[function(t){var r=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){return"_value"in e?e._value:e.value}));e.positionFilter=t.target.multiple?r:r[0]},e.filterTable]}},[t("option",{attrs:{value:""}},[e._v("พนักงานที่ลางาน")]),e._v(" "),t("option",{attrs:{value:"Assistant PM"}},[e._v("Assistant PM")]),e._v(" "),t("option",{attrs:{value:"Manager"}},[e._v("Manager")])]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.searchQuery,expression:"searchQuery"}],attrs:{type:"text",placeholder:"ค้นหา"},domProps:{value:e.searchQuery},on:{input:[function(t){t.target.composing||(e.searchQuery=t.target.value)},e.filterTable]}})])]),e._v(" "),e.selectedUser?t("LeaveDetails",{attrs:{user:e.selectedUser},on:{"go-back":e.goBack,save:e.saveUser}}):e._e(),e._v(" "),e.selectedUser?e._e():t("table",[e._m(0),e._v(" "),t("tbody",e._l(e.filteredLeaveRequests.slice(0,e.itemsPerPage),(function(o,n){return t("tr",{key:o.employeeId+n},[t("td",[e._v(e._s(n+1))]),e._v(" "),t("td",[e._v(e._s(o.employeeId))]),e._v(" "),t("td",[e._v(e._s(o.fullName))]),e._v(" "),t("td",[e._v(e._s(o.position))]),e._v(" "),t("td",[e._v(e._s(o.startDate))]),e._v(" "),t("td",[e._v(e._s(o.startTime))]),e._v(" "),t("td",[e._v(e._s(o.endDate))]),e._v(" "),t("td",[e._v(e._s(o.endTime))]),e._v(" "),t("td",[t("span",{class:{approved:"อนุมัติ"===o.status,rejected:"ไม่อนุมัติ"===o.status,pending:"รออนุมัติ"===o.status}},[e._v("\n                        "+e._s(o.status)+"\n                    ")])]),e._v(" "),t("td",{staticClass:"action-buttons"},[t("button",{staticClass:"view-btn",on:{click:function(t){return e.viewUser(o)}}},[t("img",{staticClass:"icon",attrs:{src:r(383),alt:""}})])])])})),0)])],1)}),[function(){var e=this,t=e._self._c;return t("thead",[t("tr",[t("th",[e._v("ลำดับ")]),e._v(" "),t("th",[e._v("รหัสพนักงาน")]),e._v(" "),t("th",[e._v("ชื่อ-นามสกุล")]),e._v(" "),t("th",[e._v("ตำแหน่ง")]),e._v(" "),t("th",[e._v("วันที่ลาวันแรก")]),e._v(" "),t("th",[e._v("เวลาเริ่มต้น")]),e._v(" "),t("th",[e._v("วันที่ลาวันสุดท้าย")]),e._v(" "),t("th",[e._v("เวลาสิ้นสุด")]),e._v(" "),t("th",[e._v("สถานะคำขอ")]),e._v(" "),t("th",[e._v("ปรับแต่ง")])])])}],!1,null,"3fc288d3",null);t.default=component.exports}}]);