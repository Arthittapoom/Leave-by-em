<template>
  <div>
    <!-- ตรวจสอบก่อนว่ามี chartData และ datasets -->
    <PieChart v-if="chartData && chartData.datasets.length" :chart-data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from "chart.js";
import axios from "axios";

// กำหนดให้ Chart.js รู้จักกับส่วนประกอบที่ใช้
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default defineComponent({
  name: "App",
  components: {
    PieChart: Pie,
  },
  data() {
    return {
      chartData: null, // เริ่มต้นเป็น null เพื่อให้คอมโพเนนต์ไม่แสดงกราฟจนกว่าจะมีข้อมูล
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
            },
          },
          title: {
            display: true,
            text: "ประเภทการลา",
          },
        },
      },
      typeLeave: {
        personal: 0,
        unpaid: 0,
        vacation: 0,
        annual: 0,
        sick: 0,
        business: 0,
        special: 0,
        maternity: 0,

// annual
// business
// maternity
// personal
// sick
// special
// unpaid
// vacation

      },
    };
  },
  mounted() {
    // this.getLeaveData();
    // console.log(this.typeLeave);

    this.chartData = {
            labels: [
              "ลากิจพิเศษ",
              "ลาไม่รับค่าจ้าง",
              "ลาพักร้อน",
              "ลาหยุดประจำปี",
              "ลาป่วย",
              "ลากิจ",
              "ลาปสมบท",
              "ลาคลอด",
            ],
            datasets: [
              {
                label: "จำนวน",
                backgroundColor: [
                  "#ff6666", // ลากิจพิเศษ
                  "#ff99cc", // ลาไม่รับค่าจ้าง
                  "#cc99ff", // ลาพักร้อน
                  "#6666cc", // ลาหยุดประจำปี
                  "#66ccff", // ลาป่วย
                  "#99cc99", // ลากิจ
                  "#ffcc66", // ลาปสมบท
                  "#ffcc99", // ลาคลอด
                ],
                data: [
                this.typeLeave.personal,
                this.typeLeave.unpaid,
                this.typeLeave.vacation,
                this.typeLeave.annual,
                this.typeLeave.sick,
                this.typeLeave.business,
                this.typeLeave.special,
                this.typeLeave.maternity,
                ],
              },
            ],
          };

  },
  props: ["typeLeave"],
  methods: {
    getLeaveData() {
      axios
        .get(`${process.env.API_URL}/leave/getLeaves`)
        .then((response) => {
          const data = response.data;
          // นับจำนวนการลาแต่ละประเภทจากข้อมูลที่ดึงมา
          this.typeLeave.personal = data.filter((leave) => leave.type === "ลากิจพิเศษ").length;
          this.typeLeave.unpaid = data.filter((leave) => leave.type === "ลาไม่รับค่าจ้าง").length;
          this.typeLeave.vacation = data.filter((leave) => leave.type === "ลาพักร้อน").length;
          this.typeLeave.annual = data.filter((leave) => leave.type === "ลาหยุดประจำปี").length;
          this.typeLeave.sick = data.filter((leave) => leave.type === "ลาป่วย").length;
          this.typeLeave.business = data.filter((leave) => leave.type === "ลากิจ").length;
          this.typeLeave.special = data.filter((leave) => leave.type === "ลาปสมบท").length;
          this.typeLeave.maternity = data.filter((leave) => leave.type === "ลาคลอด").length;

          // อัปเดตข้อมูล chartData และใช้สีตามที่คุณกำหนด
          this.chartData = {
            labels: [
              "ลากิจพิเศษ",
              "ลาไม่รับค่าจ้าง",
              "ลาพักร้อน",
              "ลาหยุดประจำปี",
              "ลาป่วย",
              "ลากิจ",
              "ลาปสมบท",
              "ลาคลอด",
            ],
            datasets: [
              {
                label: "จำนวน",
                backgroundColor: [
                  "#ff6666", // ลากิจพิเศษ
                  "#ff99cc", // ลาไม่รับค่าจ้าง
                  "#cc99ff", // ลาพักร้อน
                  "#6666cc", // ลาหยุดประจำปี
                  "#66ccff", // ลาป่วย
                  "#99cc99", // ลากิจ
                  "#ffcc66", // ลาปสมบท
                  "#ffcc99", // ลาคลอด
                ],
                data: [
                  this.typeLeave.personal,
                  this.typeLeave.unpaid,
                  this.typeLeave.vacation,
                  this.typeLeave.annual,
                  this.typeLeave.sick,
                  this.typeLeave.business,
                  this.typeLeave.special,
                  this.typeLeave.maternity,
                ],
              },
            ],
          };

          // console.log(this.chartData);
        })
        .catch((error) => {
          console.log("Error fetching leave data:", error);
        });
    },
  },
});
</script>

<style>
/* คุณสามารถเพิ่มสไตล์ของคุณที่นี่ */
.PieChart {
  max-width: 100%;
}

.chart-description {
  margin-top: 20px;
  font-size: 14px;
  color: #333;
}

canvas {
  margin-bottom: 30px;
  /* เพิ่มพื้นที่ว่างใต้กราฟ */
}

.chart-legend {
  display: block;
  text-align: center;
  margin-top: 20px;
  /* กำหนด margin ให้ legend ลงไปด้านล่าง */
}
</style>