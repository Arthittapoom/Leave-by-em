(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{380:function(t,e,l){var content=l(390);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,l(131).default)("e1babe2a",content,!0,{sourceMap:!1})},389:function(t,e,l){"use strict";l(380)},390:function(t,e,l){var o=l(130)((function(i){return i[1]}));o.push([t.i,"h2[data-v-521bfb7c]{font-family:Arial,sans-serif}input[type=file][data-v-521bfb7c]{margin:10px 0}button[data-v-521bfb7c]{background-color:#4caf50;border:none;color:#fff;cursor:pointer;padding:10px 15px}button[data-v-521bfb7c]:hover{background-color:#45a049}div[data-v-521bfb7c]{color:#333;font-family:Arial,sans-serif;margin-top:20px}",""]),o.locals={},t.exports=o},413:function(t,e,l){"use strict";l.r(e);var o=l(106),n=l.n(o),r={data:function(){return{selectedFile:null,uploadStatus:""}},methods:{handleFileUpload:function(t){this.selectedFile=t.target.files[0]},uploadFile:function(){var t=this;if(this.selectedFile){var e=new FormData;e.append("files",this.selectedFile);var l={method:"post",url:"http://localhost:3002/master/migrate-data",headers:{"Content-Type":"multipart/form-data"},data:e};n.a.request(l).then((function(e){t.uploadStatus="File uploaded successfully!",console.log(e.data)})).catch((function(e){t.uploadStatus="File upload failed. Please try again.",console.error(e)}))}else this.uploadStatus="Please select a file first."}}},c=(l(389),l(87)),component=Object(c.a)(r,(function(){var t=this,e=t._self._c;return e("div",[e("h2",[t._v("Upload File")]),t._v(" "),e("input",{attrs:{type:"file"},on:{change:t.handleFileUpload}}),t._v(" "),e("button",{on:{click:t.uploadFile}},[t._v("Upload")]),t._v(" "),t.uploadStatus?e("div",[t._v(t._s(t.uploadStatus))]):t._e()])}),[],!1,null,"521bfb7c",null);e.default=component.exports}}]);