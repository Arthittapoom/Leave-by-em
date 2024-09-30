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

        <div class="approval-container">
            <div class="approval-item">
              <p>อนุมัติ</p>
              <div class="approval-value">150</div>
            </div>
            <div class="approval-item">
              <p>ไม่อนุมัติ</p>
              <div class="approval-value">50</div>
            </div>
            <div class="approval-item">
              <p>รออนุมัติ</p>
              <div class="approval-value">150</div>
            </div>
          </div>

      </div>
      <div class="col box-right">
        <div class="stats-container">

          <div class="row stats">
            <div class="stat-box col-4" v-for="(stat, index) in stats" :key="index"
              :style="{ backgroundColor: stat.color }">
              <span class="stat-value">{{ stat.value }}</span>
              <small>{{ stat.label }}</small>
            </div>
          </div>


          <!-- Summary Section -->
          <div class="summary-container">
            <div class="summary-item">
              <p>จำนวนพนักงาน</p>
              <div class="summary-value">25</div>
              <span class="summary-unit">คน</span>
            </div>
            <div class="summary-item">
              <p>พนักงานลาออก</p>
              <div class="summary-value">5</div>
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
import PieChart from '../../components/PieChart.vue'

export default {
  components: {
    PieChart
  },

  data() {
    return {
      pieData: null,
      stats: [
        { label: 'ลากิจพิเศษ', value: 3, color: '#ff6666' },
        { label: 'ลาไม่รับค่าจ้าง', value: 1, color: '#ff99cc' },
        { label: 'ลาพักร้อน', value: 4, color: '#cc99ff' },
        { label: 'ลาหยุดประจำปี', value: 2, color: '#6666cc' },
        { label: 'ลาป่วย', value: 8, color: '#66ccff' },
        { label: 'ลากิจ', value: 3, color: '#99cc99' },
        { label: 'ลาปสมบท', value: 1, color: '#ffcc66' },
        { label: 'ลาคลอด', value: 1, color: '#ffcc99' }
      ]
    };
  },
  mounted() {
    
    // Simulate data loading
    setTimeout(() => {
      this.pieData = {
        labels: ['ลาป่วย', 'ลาพักร้อน', 'ลากิจ', 'ลาคลอด', 'ลากิจพิเศษ', 'ลาไม่รับค่าจ้าง', 'ลาหยุดพักผ่อนประจำปี', 'ลาปสมบท'],
        datasets: [
          {
            backgroundColor: ['#66ccff', '#cc99ff', '#99cc99', '#ffcc99', '#ff6666', '#ff99cc', '#6666cc', '#ffcc66'],
            data: [8, 4, 3, 1, 3, 1, 2, 1]
          }
        ]
      };
    }, 1000);
  },
  methods: {
    updatePage(page) {
      this.$store.dispatch('updatePage', page);
    }
  }
}
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
