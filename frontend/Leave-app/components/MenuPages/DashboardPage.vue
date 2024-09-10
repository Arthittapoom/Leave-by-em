<template>
  <div>
    <!-- <h2>ภาพรวมการลาของพนักงาน</h2> -->
    <div class="chart-section">
      <!-- <pie-chart :chart-data="pieData" /> -->
      <!-- <h1>pie-chart</h1> -->
    </div>
    <div class="stats-section">
      <div class="stat-box" v-for="(stat, index) in stats" :key="index">
        {{ stat.value }}
        <small>{{ stat.label }}</small>
      </div>
    </div>
    <div class="summary-section">
      <p>จำนวนพนักงาน: 25 คน</p>
      <p>พนักงานลาออก: 5 คน</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pieData: {
        labels: ['ลาป่วย', 'ลาพักร้อน', 'ลากิจ', 'ลาคลอด', 'ลากิจพิเศษ', 'ลาไปปรับทำฟัน', 'ลาหยุดพักผ่อนประจำปี', 'ลาชุมชน'],
        datasets: [
          {
            label: 'Leave Types',
            backgroundColor: ['#3cba9f', '#ffcc00', '#ff6666', '#c45850', '#8e5ea2', '#3e95cd', '#e8c3b9', '#c4e17f'],
            data: [8, 4, 3, 1, 3, 1, 2, 1]
          }
        ]
      },
      stats: [
        { label: 'ลาป่วย', value: 8 },
        { label: 'ลาพักร้อน', value: 4 },
        { label: 'ลากิจ', value: 3 },
        { label: 'ลาคลอด', value: 1 },
        { label: 'ลาคิดพิเศษ', value: 3 },
        { label: 'ลาไปปรับทำฟัน', value: 1 },
        { label: 'ลาหยุดพักผ่อนประจำปี', value: 2 },
        { label: 'ลาชุมชน', value: 1 },
      ]
    }
  }
}
</script>

<style scoped>
.chart-section {
  margin-bottom: 20px;
}

.stats-section {
  display: flex;
  flex-wrap: wrap;
}

.stat-box {
  background-color: #f5f5f5;
  margin: 10px;
  padding: 20px;
  flex: 1 1 30%;
  text-align: center;
}

.summary-section {
  margin-top: 20px;
}

.stat-box small {
  display: block;
  margin-top: 10px;
  color: #999;
}
</style>