(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{389:function(e,t,r){var content=r(394);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,r(135).default)("1155cafc",content,!0,{sourceMap:!1})},393:function(e,t,r){"use strict";r(389)},394:function(e,t,r){var o=r(134)((function(i){return i[1]}));o.push([e.i,'.form-container[data-v-ab0d7358]{font-family:"Arial",sans-serif;margin-left:250px;padding:60px 20px;position:absolute;width:700px}h2[data-v-ab0d7358]{font-size:1.5rem;font-weight:400;text-align:center}.form-group[data-v-ab0d7358],h2[data-v-ab0d7358]{margin-bottom:20px}.form-group[data-v-ab0d7358]{align-items:center;display:flex}label[data-v-ab0d7358]{color:#000;font-size:14px;font-weight:700;margin-right:-60px;text-align:left;width:30%}input[data-v-ab0d7358],select[data-v-ab0d7358]{border:1px solid #ccc;border-radius:30px;font-size:14px;height:50px;outline:none;padding:15px;width:70%}input[data-v-ab0d7358]::-moz-placeholder{color:#cfcfcf}input[data-v-ab0d7358]::placeholder{color:#cfcfcf}select[data-v-ab0d7358]{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:#fff}select[data-v-ab0d7358]:focus{border-color:#007bff}.form-buttons[data-v-ab0d7358]{display:flex;justify-content:flex-end;margin-top:30px;position:relative;right:60px}button[data-v-ab0d7358]{border:none;border-radius:30px;cursor:pointer;font-size:16px;padding:10px 30px}.cancel-btn[data-v-ab0d7358]{background-color:#f5f5f5;color:#555;margin-right:10px}.create-btn[data-v-ab0d7358]{background-color:#00bfa5;color:#fff}.cancel-btn[data-v-ab0d7358]:hover,.create-btn[data-v-ab0d7358]:hover{opacity:.8}.cancel-btn[data-v-ab0d7358]:hover{background-color:#e5e5e5}.create-btn[data-v-ab0d7358]:hover{background-color:#00897b}',""]),o.locals={},e.exports=o},412:function(e,t,r){"use strict";r.r(t);r(5),r(23),r(4);var o={props:["users"],data:function(){return{user:{username:this.users.username,fullname:this.users.fullname,email:this.users.email,phone:this.users.phone,password:"*********",role:this.users.role}}},methods:{updateUser:function(){this.$emit("updateUserAdmin",this.user)},cancel:function(){this.$emit("closeViewUserAdmin")}},mounted:function(){}},n=(r(393),r(90)),component=Object(n.a)(o,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"form-container"},[t("h2",[e._v("สร้างผู้ดูและระบบ")]),e._v(" "),t("form",{on:{submit:function(t){return t.preventDefault(),e.updateUser.apply(null,arguments)}}},[t("div",{staticClass:"form-group"},[t("label",{attrs:{for:"username"}},[e._v("ชื่อผู้ใช้งาน *")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.username,expression:"user.username"}],attrs:{type:"text",id:"username",placeholder:"กรอกชื่อผู้ใช้งาน",required:""},domProps:{value:e.user.username},on:{input:function(t){t.target.composing||e.$set(e.user,"username",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"form-group"},[t("label",{attrs:{for:"fullname"}},[e._v("ชื่อ-นามสกุล *")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.fullname,expression:"user.fullname"}],attrs:{type:"text",id:"fullname",placeholder:"กรอกชื่อ-นามสกุล",required:""},domProps:{value:e.user.fullname},on:{input:function(t){t.target.composing||e.$set(e.user,"fullname",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"form-group"},[t("label",{attrs:{for:"email"}},[e._v("อีเมล *")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.email,expression:"user.email"}],attrs:{type:"email",id:"email",placeholder:"กรอกอีเมล",required:""},domProps:{value:e.user.email},on:{input:function(t){t.target.composing||e.$set(e.user,"email",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"form-group"},[t("label",{attrs:{for:"phone"}},[e._v("เบอร์โทร *")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.phone,expression:"user.phone"}],attrs:{type:"tel",id:"phone",placeholder:"กรอกเบอร์โทร",required:""},domProps:{value:e.user.phone},on:{input:function(t){t.target.composing||e.$set(e.user,"phone",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"form-group"},[t("label",{attrs:{for:"password"}},[e._v("รหัสผ่าน *")]),e._v(" "),t("input",{directives:[{name:"model",rawName:"v-model",value:e.user.password,expression:"user.password"}],attrs:{type:"password",id:"password",placeholder:"กรอกรหัสผ่าน",required:""},domProps:{value:e.user.password},on:{input:function(t){t.target.composing||e.$set(e.user,"password",t.target.value)}}})]),e._v(" "),t("div",{staticClass:"form-group"},[t("label",{attrs:{for:"role"}},[e._v("หน้าที่ *")]),e._v(" "),t("select",{directives:[{name:"model",rawName:"v-model",value:e.user.role,expression:"user.role"}],attrs:{id:"role",required:""},on:{change:function(t){var r=Array.prototype.filter.call(t.target.options,(function(e){return e.selected})).map((function(e){return"_value"in e?e._value:e.value}));e.$set(e.user,"role",t.target.multiple?r:r[0])}}},[t("option",{attrs:{disabled:"",value:""}},[e._v("เลือกหน้าที่")]),e._v(" "),t("option",{attrs:{value:"Administrator"}},[e._v("Administrator")]),e._v(" "),t("option",{attrs:{value:"Manager"}},[e._v("Manager")])])]),e._v(" "),t("div",{staticClass:"form-buttons"},[t("button",{staticClass:"cancel-btn",attrs:{type:"button"},on:{click:e.cancel}},[e._v("ย้อนกลับ")]),e._v(" "),t("button",{staticClass:"create-btn",attrs:{type:"submit"}},[e._v("บันทึก")])])])])}),[],!1,null,"ab0d7358",null);t.default=component.exports}}]);