(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{391:function(e,t,n){var content=n(405);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(131).default)("af9e29d2",content,!0,{sourceMap:!1})},403:function(e,t,n){e.exports=n.p+"img/logo.49fe543.svg"},404:function(e,t,n){"use strict";n(391)},405:function(e,t,n){var r=n(130)((function(i){return i[1]}));r.push([e.i,".background[data-v-4e2da8e3]{align-items:start;background-image:url(/login/bg.svg);background-position:50%;background-repeat:no-repeat;background-size:cover;display:flex;height:100vh;justify-content:center;width:100vw}.form-login[data-v-4e2da8e3]{align-items:center;display:flex;flex-direction:column;padding-bottom:50px}.form-login img[data-v-4e2da8e3]{width:200px}.form-login .card[data-v-4e2da8e3]{background:#fff;border-radius:19px;box-shadow:0 4px 4px rgba(0,0,0,.25);box-sizing:border-box}.form-login .card[data-v-4e2da8e3],.form-login .p-center[data-v-4e2da8e3]{align-items:center;display:flex;flex-direction:column}.form-login .div-p-center[data-v-4e2da8e3]{align-items:start;display:flex;flex-direction:column}.form-login p[data-v-4e2da8e3]{font-size:20px;font-weight:300}.form-login input[data-v-4e2da8e3]{border:1px solid #5c5c5c;border-radius:30px;box-sizing:border-box;height:34px;margin-bottom:10px;padding-left:10px;width:276.47px}.form-login button[data-v-4e2da8e3]{background:#306;border-radius:40px;color:#fff;height:31px;margin-top:10px;width:121px}",""]),r.locals={},e.exports=r},410:function(e,t,n){"use strict";n.r(t);n(36);var r=n(41),o=(n(88),n(20),n(5),n(8),n(4),n(125)),d=n.n(o),c={data:function(){return{code_id:"",data_user:{},newPhone:""}},methods:{getdata:function(e){var t=this;return Object(r.a)(regeneratorRuntime.mark((function e(){var n,r,o;return regeneratorRuntime.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,n={method:"get",url:"".concat("https://leave-api-gold.vercel.app","/users/getUsers")},e.next=4,d.a.request(n);case 4:r=e.sent,(o=r.data.filter((function(e){return e.code===t.code_id}))).length>0?(t.data_user={id:o[0]._id,name:o[0].name,nickname:o[0].nickname,department:o[0].department,code_id:o[0].code,position:o[0].position,type:o[0].employeeType,division:o[0].division,workplace:o[0].workplace,years:"".concat(o[0].diffDays_days," วัน"),phone:o[0].phone},t.newPhone=t.data_user.phone):alert("ไม่พบข้อมูลในระบบ"),e.next=12;break;case 9:e.prev=9,e.t0=e.catch(0),console.error(e.t0);case 12:case"end":return e.stop()}}),e,null,[[0,9]])})))()},register:function(e){var t=this;return Object(r.a)(regeneratorRuntime.mark((function n(){var r,o,data,c;return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:if(r=localStorage.getItem("profile"),o=r?JSON.parse(r).userId:null,t.newPhone){n.next=5;break}return alert("กรุณากรอกเบอร์โทรศัพท์"),n.abrupt("return");case 5:return n.prev=5,data=JSON.stringify({lineId:o,phone:t.newPhone}),c={method:"put",url:"".concat("https://leave-api-gold.vercel.app","/users/updateUser/").concat(e.id),headers:{"Content-Type":"application/json"},data:data},n.next=10,d.a.request(c);case 10:n.sent,t.$router.push("/home"),n.next=17;break;case 14:n.prev=14,n.t0=n.catch(5),console.error(n.t0);case 17:case"end":return n.stop()}}),n,null,[[5,14]])})))()}}},l=(n(404),n(87)),component=Object(l.a)(c,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"background"},[t("div",{staticClass:"form-login mt-5"},[t("img",{staticClass:"logo",attrs:{src:n(403),alt:""}}),e._v(" "),t("p",[e._v("ลงทะเบียน")]),e._v(" "),t("div",{staticClass:"card pt-4 pb-4 pl-5 pr-5"},[e._m(0),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.code_id,expression:"code_id"}],attrs:{type:"text",name:"code_id",id:""},domProps:{value:e.code_id},on:{input:function(t){t.target.composing||(e.code_id=t.target.value)}}}),e._v(" "),t("button",{on:{click:function(t){return e.getdata(e.code_id)}}},[e._v("เรียกข้อมูลพนักงาน")]),e._v(" "),e.data_user.name?t("div",{staticClass:"div-p-center"},[t("p",{staticClass:"mt-3"},[e._v("ชื่อ-นามสกุล")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.name,expression:"data_user.name"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.name},on:{input:function(t){t.target.composing||e.$set(e.data_user,"name",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("ชื่อเล่น")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.nickname,expression:"data_user.nickname"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.nickname},on:{input:function(t){t.target.composing||e.$set(e.data_user,"nickname",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("สังกัด")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.department,expression:"data_user.department"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.department},on:{input:function(t){t.target.composing||e.$set(e.data_user,"department",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("รหัสพนักงาน")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.code_id,expression:"data_user.code_id"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.code_id},on:{input:function(t){t.target.composing||e.$set(e.data_user,"code_id",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("ตำแหน่ง")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.position,expression:"data_user.position"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.position},on:{input:function(t){t.target.composing||e.$set(e.data_user,"position",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("ประเภทพนักงาน")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.type,expression:"data_user.type"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.type},on:{input:function(t){t.target.composing||e.$set(e.data_user,"type",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("ฝ่าย")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.division,expression:"data_user.division"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.division},on:{input:function(t){t.target.composing||e.$set(e.data_user,"division",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("สถานที่ปฏิบัติงาน")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.workplace,expression:"data_user.workplace"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.workplace},on:{input:function(t){t.target.composing||e.$set(e.data_user,"workplace",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("อายุงาน")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.data_user.years,expression:"data_user.years"}],attrs:{type:"text",name:"",id:"",readonly:""},domProps:{value:e.data_user.years},on:{input:function(t){t.target.composing||e.$set(e.data_user,"years",t.target.value)}}}),e._v(" "),t("p",{staticClass:"mt-1"},[e._v("เบอร์โทรศัพท์")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.newPhone,expression:"newPhone"}],attrs:{type:"text",name:"phone",id:""},domProps:{value:e.newPhone},on:{input:function(t){t.target.composing||(e.newPhone=t.target.value)}}})]):e._e(),e._v(" "),e.data_user.name?t("button",{on:{click:function(t){return e.register(e.data_user)}}},[e._v("ลงทะเบียน")]):e._e()])])])}),[function(){var e=this._self._c;return e("div",{staticClass:"p-center"},[e("p",[this._v("กรอกรหัสพนักงาน")])])}],!1,null,"4e2da8e3",null);t.default=component.exports}}]);