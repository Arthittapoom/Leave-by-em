<template>
  <div>
    <div class="scrollable-content row">
      <!-- Pie Chart Section -->
      <div class="chart-container col" v-if="pieData">
        <PieChart :chart-data="pieData" />
      </div>
      
      <!-- Statistics Section -->
      <div class="stats-container col">
        <div class="stat-box" v-for="(stat, index) in stats" :key="index" :style="{ backgroundColor: stat.color }">
          <span class="stat-value">{{ stat.value }}</span>
          <small>{{ stat.label }}</small>
        </div>

        <!-- Summary Section -->
        <div class="summary-container">
          <div class="summary-item">
            <p>จำนวนพนักงาน</p>
            <div class="summary-value">25 คน</div>
          </div>
          <div class="summary-item">
            <p>พนักงานลาออก</p>
            <div class="summary-value">5 คน</div>
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
  }
}
</script>

<style scoped>
/* Main container */
.main-container {
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
}

/* Chart container */
.chart-container {
  width: 40%;
}

/* Stats container */
.stats-container {
  width: 20%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

/* Stat box styling */
.stat-box {
  margin: 10px;
  padding: 15px;
  text-align: center;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Stat value styling */
.stat-value {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 5px;
}

/* Summary container */
.summary-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 20px;
  height: 200px;
}

/* Summary item styling */
.summary-item {
  background-color: #ffe6e6;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  font-size: 18px;
}

/* Summary value styling */
.summary-value {
  background-color: #ff6666;
  padding: 10px;
  border-radius: 5px;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

/* Scrollable content */
.scrollable-content {
  width: 100%;
  height: 85vh;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 10px;
}

/* Custom scrollbar */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: #ffffff;
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: #ffffff;
}
</style>
