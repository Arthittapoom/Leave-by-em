<template>
  <div>
    <div class="row">
      <div class="col box-left">
        <!-- Pie Chart Section -->
        <div class="chart-container" v-if="pieData">
          <PieChart class="pie-chart" :chart-data="pieData" />
        </div>
        <!-- Loading Section -->
        <div class="chart-container" v-else>
          <div class="loading text-center">
            <div class="spinner-grow text-success" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>

        <!-- Approval Section -->
        <div class="approval-container">
          <div class="approval-item" v-for="(item, index) in approvalData" :key="index">
            <p>{{ item.label }}</p>
            <div class="approval-value">{{ item.value }}</div>
          </div>
        </div>
      </div>

      <div class="col box-right">
        <div class="stats-container">
          <div class="row stats">
            <div
              class="stat-box col-4"
              v-for="(stat, index) in stats"
              :key="index"
              :style="{ backgroundColor: stat.color }"
            >
              <span class="stat-value">{{ stat.value }}</span>
              <small>{{ stat.label }}</small>
            </div>
          </div>

          <!-- Summary Section -->
          <div class="summary-container">
            <div class="summary-item">
              <p>จำนวนพนักงาน</p>
              <div class="summary-value">{{ employeeCount }}</div>
              <span class="summary-unit">คน</span>
            </div>
            <div class="summary-item">
              <p>พนักงานลาออก</p>
              <div class="summary-value">{{ resignedCount }}</div>
              <span class="summary-unit">คน</span>
              <button @click="updatePage('UsersManagementPage')" class="employee-info-btn">ข้อมูลพนักงาน</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PieChart from "../../components/PieChart.vue";
import axios from "axios";

export default {
  components: {
    PieChart,
  },

  data() {
    return {
      pieData: null,
      employeeCount: 0,
      resignedCount: 0, // เปลี่ยนให้เป็นตัวแปร
      typeLeave: {
        sick: 0,
        unpaid: 0,
        vacation: 0,
        annual: 0,
        personal: 0,
        business: 0,
        special: 0,
        maternity: 0,
      },
      approvalData: [
        { label: "อนุมัติ", value: 150 },
        { label: "ไม่อนุมัติ", value: 50 },
        { label: "รออนุมัติ", value: 150 },
      ],
      stats: [],
    };
  },

  mounted() {
    this.getLeaves();
    this.getUsers();
  },

  methods: {
    getUsers() {
      axios
        .get(`${process.env.API_URL}/users/getUsers`)
        .then((response) => {
          this.employeeCount = response.data.length;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    getLeaves() {
      axios
        .get(`${process.env.API_URL}/leave/getLeaves`)
        .then((response) => {
          const data = response.data;
          // จำนวน stats อนุมัติ ไม่อนุมัติ รออนุมัติ
          this.approvalData = [
            { label: "อนุมัติ", value: data.filter((leave) => leave.status === "อนุมัติ").length },
            { label: "ไม่อนุมัติ", value: data.filter((leave) => leave.status === "ไม่อนุมัติ").length },
            { label: "รออนุมัติ", value: data.filter((leave) => leave.status === "รออนุมัติ").length },
          ];

          this.typeLeave = {
            sick: data.filter((leave) => leave.type === "ลาป่วย").length,
            unpaid: data.filter((leave) => leave.type === "ลาไม่รับค่าจ้าง").length,
            vacation: data.filter((leave) => leave.type === "ลาพักร้อน").length,
            annual: data.filter((leave) => leave.type === "ลาหยุดประจำปี").length,
            personal: data.filter((leave) => leave.type === "ลากิจพิเศษ").length,
            business: data.filter((leave) => leave.type === "ลากิจ").length,
            special: data.filter((leave) => leave.type === "ลาปสมบท").length,
            maternity: data.filter((leave) => leave.type === "ลาคลอด").length,
          };

          this.stats = [
            { label: "ลากิจพิเศษ", value: this.typeLeave.personal, color: "#ff6666" },
            { label: "ลาไม่รับค่าจ้าง", value: this.typeLeave.unpaid, color: "#ff99cc" },
            { label: "ลาพักร้อน", value: this.typeLeave.vacation, color: "#cc99ff" },
            { label: "ลาหยุดประจำปี", value: this.typeLeave.annual, color: "#6666cc" },
            { label: "ลาป่วย", value: this.typeLeave.sick, color: "#66ccff" },
            { label: "ลากิจ", value: this.typeLeave.business, color: "#99cc99" },
            { label: "ลาปสมบท", value: this.typeLeave.special, color: "#ffcc66" },
            { label: "ลาคลอด", value: this.typeLeave.maternity, color: "#ffcc99" },
          ];

          this.pieData = {
            labels: Object.keys(this.typeLeave),
            datasets: [
              {
                backgroundColor: ["#66ccff", "#cc99ff", "#99cc99", "#ffcc99", "#ff6666", "#ff99cc", "#6666cc", "#ffcc66"],
                data: Object.values(this.typeLeave),
              },
            ],
          };
        })
        .catch((error) => {
          console.log(error);
        });
    },

    updatePage(page) {
      this.$store.dispatch("updatePage", page);
    },
  },
};
</script>


<style scoped>
.box-left {
  width: 100%;
  height: 80vh;
  /* background-color: #e57373; */
}

.box-right {
  width: 100%;
  height: 80vh;
  /* background-color: #762828; */
}

/* Chart container */
.chart-container {
  width: 100%;
  height: 80%;

  .pie-chart {
    width: 70%;
    height: 70%;
    margin: 0 auto;
  }
}

/* Loading section */
.loading {
  font-size: 18px;
  text-align: center;
  padding: 50px;
  color: #666666;
  width: 100%;
  height: 100%;
}

/* Stats container */
.stats-container {
  width: 100%;
}

/* Stat box styling */
.stat-box {
  margin: 10px;
  padding: 20px;
  text-align: center;
  border-radius: 10px;
  color: white;
  font-size: 18px;
  width: 100px;
  height: 93px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Stat value styling */
.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.summary-container {
  padding: 10px;

  margin-top: 20px;
}

.summary-item {
  margin-bottom: 20px;
  text-align: center;
  border: 2px solid #e57373;
  border-radius: 20px;
  padding: 20px;
  width: 70%;
  height: 50px;
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.summary-item p {
  font-size: 16px;
  color: #e57373;
  margin: 0;
}

.summary-value {
  font-size: 20px;
  color: #e57373;
  font-weight: bold;
  margin: 10px;
}

.summary-unit {
  font-size: 16px;
  color: #e57373;
}

.employee-info-btn {
  background-color: #e57373;
  color: white;
  border: none;
  margin-left: 10px;
  padding: 10px 20px;
  border-radius: 20px;
  /* margin-top: 10px; */
  cursor: pointer;
  font-size: 16px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  height: 40px;
}

/* Approval container */
.approval-container {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;

}

.approval-item {
  text-align: center;
  width: 30%;
  background-color: #f2f2f2;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.approval-item p {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.approval-value {
  font-size: 36px;
  color: #333;
  font-weight: bold;
  margin-top: 5px;
}
</style>
