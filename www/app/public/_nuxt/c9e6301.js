(window.webpackJsonp=window.webpackJsonp||[]).push([[27],{528:function(e,t,r){"use strict";r.r(t);var n=r(41),o=(r(90),r(8),{data:function(){return{profile:null}},methods:{login:function(){var e=this;return Object(n.a)(regeneratorRuntime.mark((function t(){var n,o,l;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:n=localStorage.getItem("profile")?JSON.parse(localStorage.getItem("profile")).userId:null,o=r(107),l={method:"get",maxBodyLength:1/0,url:"http://localhost:3002/users/getUserByLineId/"+n,headers:{}},o.request(l).then((function(t){console.log("พบข้อมูลผู้ใช้งาน"),e.loginWithLINE(!0)})).catch((function(t){console.log(t),console.log("ไม่พบข้อมูลผู้ใช้งาน"),localStorage.removeItem("profile"),e.loginWithLINE(!1)}));case 4:case"end":return t.stop()}}),t)})))()},loginWithLINE:function(s){var e=this;return Object(n.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:if(!localStorage.getItem("profile")){t.next=10;break}if(e.profile=JSON.parse(localStorage.getItem("profile")),-1!==navigator.userAgent.indexOf("Mobile")){t.next=7;break}return t.next=5,e.$router.push("/login-admin");case 5:t.next=9;break;case 7:return t.next=9,e.$router.push("/home/home");case 9:return t.abrupt("return");case 10:if(e.$liff.isLoggedIn()){t.next=15;break}return t.next=13,e.$liff.login();case 13:t.next=33;break;case 15:return t.prev=15,t.next=18,e.$liff.getProfile();case 18:return e.profile=t.sent,t.next=21,localStorage.setItem("profile",JSON.stringify(e.profile));case 21:if(-1!==navigator.userAgent.indexOf("Mobile")){t.next=26;break}return t.next=24,e.$router.push("/login-admin");case 24:t.next=28;break;case 26:return t.next=28,e.$router.push("/login");case 28:t.next=33;break;case 30:t.prev=30,t.t0=t.catch(15),console.error("Error getting profile:",t.t0);case 33:case"end":return t.stop()}}),t,null,[[15,30]])})))()}},mounted:function(){this.login()}}),l=r(88),component=Object(l.a)(o,(function(){return(0,this._self._c)("div")}),[],!1,null,null,null);t.default=component.exports}}]);