(window.webpackJsonp=window.webpackJsonp||[]).push([[31],{479:function(t,e,o){var content=o(505);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,o(132).default)("bc54bfea",content,!0,{sourceMap:!1})},503:function(t,e,o){t.exports=o.p+"img/logo.c1a8be2.png"},504:function(t,e,o){"use strict";o(479)},505:function(t,e,o){var r=o(131),n=o(506),d=o(507),l=r((function(i){return i[1]})),c=n(d);l.push([t.i,".bg-image[data-v-2fdfca39]{align-items:center;background-image:url("+c+");background-position:50%;background-size:cover;display:flex;height:100vh;justify-content:center}.login-container[data-v-2fdfca39]{background-color:#fff;border-radius:15px;box-shadow:0 4px 20px rgba(0,0,0,.1);display:flex;height:80%;width:70%}.login-box[data-v-2fdfca39]{display:flex;flex-direction:column;justify-content:center;padding:0 50px;width:50%}.welcome-text[data-v-2fdfca39]{text-align:center}h1[data-v-2fdfca39]{font-size:32px}h1[data-v-2fdfca39],p[data-v-2fdfca39]{color:#5a2e8e}p[data-v-2fdfca39]{font-size:18px}.input-group[data-v-2fdfca39]{margin:20px 0}label[data-v-2fdfca39]{color:#5a2e8e}input[data-v-2fdfca39],label[data-v-2fdfca39]{font-size:16px}input[data-v-2fdfca39]{border:2px solid #ddd;border-radius:8px;margin-top:5px;padding:10px;width:100%}input[data-v-2fdfca39]:focus{border-color:#5a2e8e;outline:none}.toggle-password[data-v-2fdfca39]{cursor:pointer;position:absolute;right:15px;top:45px}.forgot-password[data-v-2fdfca39]{color:#5a2e8e;cursor:pointer;font-size:14px;text-align:right}.login-btn[data-v-2fdfca39]{background-color:#5a2e8e;border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:18px;margin-top:20px;padding:10px;width:100%}.logo-box[data-v-2fdfca39]{align-items:center;background-color:#f5f5f5;border-bottom-right-radius:15px;border-top-right-radius:15px;display:flex;justify-content:center;width:50%}img[data-v-2fdfca39]{width:60%}@media (max-width:768px){.login-container[data-v-2fdfca39]{flex-direction:column;height:auto}.login-box[data-v-2fdfca39],.logo-box[data-v-2fdfca39]{border-radius:0;width:100%}}",""]),l.locals={},t.exports=l},506:function(t,e,o){"use strict";t.exports=function(t,e){return e||(e={}),"string"!=typeof(t=t&&t.__esModule?t.default:t)?t:(/^['"].*['"]$/.test(t)&&(t=t.slice(1,-1)),e.hash&&(t+=e.hash),/["'() \t\n]/.test(t)||e.needQuotes?'"'.concat(t.replace(/"/g,'\\"').replace(/\n/g,"\\n"),'"'):t)}},507:function(t,e,o){t.exports=o.p+"img/logobg.539bc53.svg"},525:function(t,e,o){"use strict";o.r(e);var r=[function(){var t=this,e=t._self._c;return e("div",{staticClass:"welcome-text"},[e("h1",[t._v("ยินดีต้อนรับ")]),t._v(" "),e("p",[t._v("ลงชื่อเข้าสู่ระบบ")])])},function(){var t=this._self._c;return t("div",{staticClass:"logo-box"},[t("img",{attrs:{src:o(503),alt:"Work Motion Logo"}})])}],n=o(107),d=o.n(n),l={data:function(){return{username:"",password:"",passwordVisible:!1}},methods:{togglePasswordVisibility:function(){this.passwordVisible=!this.passwordVisible,document.getElementById("password").type=this.passwordVisible?"text":"password"},login:function(){var t=this;if(this.username&&this.password){var e={method:"post",maxBodyLength:1/0,url:"http://localhost:3002/auth/login",headers:{"Content-Type":"application/json"},data:JSON.stringify({username:this.username,password:this.password})};d.a.request(e).then((function(e){e.data.token&&(localStorage.setItem("token",e.data.token),t.$router.push("/admin"))})).catch((function(t){t.response?alert(JSON.stringify(t.response.data)):t.request?console.error("Error request:",t.request):console.error("Error message:",t.message)}))}else alert("กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน")}}},c=(o(504),o(88)),component=Object(c.a)(l,(function(){var t=this,e=t._self._c;return e("div",{staticClass:"bg-image"},[e("div",{staticClass:"login-container"},[e("div",{staticClass:"login-box"},[t._m(0),t._v(" "),e("form",{on:{submit:function(e){return e.preventDefault(),t.login.apply(null,arguments)}}},[e("div",{staticClass:"input-group"},[e("label",{attrs:{for:"username"}},[t._v("ชื่อผู้ใช้")]),t._v(" "),e("input",{directives:[{name:"model",rawName:"v-model",value:t.username,expression:"username"}],attrs:{type:"text",id:"username",placeholder:"ชื่อผู้ใช้",required:""},domProps:{value:t.username},on:{input:function(e){e.target.composing||(t.username=e.target.value)}}})]),t._v(" "),e("div",{staticClass:"input-group"},[e("label",{attrs:{for:"password"}},[t._v("รหัสผ่าน")]),t._v(" "),e("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],attrs:{type:"password",id:"password",placeholder:"********",required:""},domProps:{value:t.password},on:{input:function(e){e.target.composing||(t.password=e.target.value)}}}),t._v(" "),e("span",{staticClass:"toggle-password",on:{click:t.togglePasswordVisibility}},[e("i",{class:t.passwordVisible?"fas fa-eye-slash":"fas fa-eye"})])]),t._v(" "),e("p",{staticClass:"forgot-password"},[t._v("ลืมรหัสผ่าน ?")]),t._v(" "),e("button",{staticClass:"login-btn",attrs:{type:"submit"}},[t._v("เข้าสู่ระบบ")])])]),t._v(" "),t._m(1)])])}),r,!1,null,"2fdfca39",null);e.default=component.exports}}]);