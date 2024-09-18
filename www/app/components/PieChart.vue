<template>
    <div>
        <!-- ตรวจสอบก่อนว่ามี chartData และ datasets -->
        <PieChart v-if="chartData && chartData.datasets.length" :chart-data="chartData" :options="chartOptions" />

    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

// กำหนดให้ Chart.js รู้จักกับส่วนประกอบที่ใช้
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

export default defineComponent({
    name: 'App',
    components: {
        PieChart: Pie
    },
    data() {
        return {
            chartData: null, // เริ่มต้นเป็น null เพื่อให้คอมโพเนนต์ไม่แสดงกราฟจนกว่าจะมีข้อมูล
            chartOptions: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20
                        }
                    },
                    title: {
                        display: true,
                        text: 'ประเภทการลา'
                    }
                }
            }



        };
    },
    mounted() {
        // กำหนดข้อมูลสำหรับกราฟหลังจากคอมโพเนนต์ถูก mount เรียบร้อยแล้ว
        this.chartData = {
            labels: ['ลาป่วย', 'ลากิจ', 'ลากิจพิเศษ', 'ลาไม่รับค่าจ้าง', 'ลาอุปสมบท', 'ลาคลอด', 'ลาพักร้อน', 'ลาหยุดพักผ่อนประจำปี'],
            datasets: [
                {
                    label: 'จำนวน',
                    backgroundColor: ['#36A2EB', '#FFCE56', '#FF6384', '#E7E9ED', '#4BC0C0', '#9966FF', '#FF9F40', '#B39DDB'],
                    data: [8, 3, 3, 1, 1, 1, 4, 2]
                }
            ]
        };
    }
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
