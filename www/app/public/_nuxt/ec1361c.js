(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{387:function(t,n,e){"use strict";e.r(n);var o=e(12),r=e(419),l=e(414);l.e.register(l.m,l.n,l.g,l.a,l.d);var c=Object(o.defineComponent)({name:"App",components:{PieChart:r.a},data:function(){return{chartData:null,chartOptions:{responsive:!0,plugins:{legend:{position:"bottom",labels:{padding:20}},title:{display:!0,text:"ประเภทการลา"}}}}},mounted:function(){this.chartData={labels:["ลาป่วย","ลากิจ","ลากิจพิเศษ","ลาไม่รับค่าจ้าง","ลาอุปสมบท","ลาคลอด","ลาพักร้อน","ลาหยุดพักผ่อนประจำปี"],datasets:[{label:"จำนวน",backgroundColor:["#36A2EB","#FFCE56","#FF6384","#E7E9ED","#4BC0C0","#9966FF","#FF9F40","#B39DDB"],data:[8,3,3,1,1,1,4,2]}]}}}),d=(e(396),e(88)),component=Object(d.a)(c,(function(){var t=this,n=t._self._c;t._self._setupProxy;return n("div",[t.chartData&&t.chartData.datasets.length?n("PieChart",{attrs:{"chart-data":t.chartData,options:t.chartOptions}}):t._e()],1)}),[],!1,null,null,null);n.default=component.exports;installComponents(component,{PieChart:e(387).default})},389:function(t,n,e){var content=e(397);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,e(132).default)("1223a87c",content,!0,{sourceMap:!1})},396:function(t,n,e){"use strict";e(389)},397:function(t,n,e){var o=e(131)((function(i){return i[1]}));o.push([t.i,".PieChart{max-width:100%}.chart-description{color:#333;font-size:14px;margin-top:20px}canvas{margin-bottom:30px}.chart-legend{display:block;margin-top:20px;text-align:center}",""]),o.locals={},t.exports=o}}]);