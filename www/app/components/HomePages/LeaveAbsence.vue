<template>
  <div class="leave-form">
    <div class="leave-credits">
      <div v-for="(leave, index) in leaveCredits" :key="index" :class="['leave-credit', leave.class]">
        <div>วัน</div>
        <div>{{ leave.remaining }}/{{ leave.total }}</div>
        <div>{{ leave.label }}</div>
      </div>
    </div>

    <!-- <pre>userData: {{ userData }}</pre> -->

    <form class="leave-request-form" @submit.prevent="submitLeaveRequest">
      <label for="leave-type">ประเภทการลา</label>
      <select id="leave-type" v-model="selectedLeaveType">
        <option value="" disabled selected>เลือกประเภทการลา</option>
        <option v-for="(leave, index) in leaveTypes" :key="index" :value="leave.value">
          {{ leave.label }}
        </option>
      </select>

      <label for="leave-reason">เหตุผลการลา</label>
      <input type="text" id="leave-reason" v-model="leaveReason" placeholder="ระบุเหตุผลการลา" />

      <label for="start-date">วันที่ลางานวันแรก</label>
      <input type="date" id="start-date" v-model="startDate" />

      <label for="end-date">วันที่ลางานวันสุดท้าย</label>
      <input type="date" id="end-date" v-model="endDate" />

      <label for="start-time">เริ่มเวลา</label>
      <input type="time" id="start-time" v-model="startTime" />

      <label for="end-time">เวลาสิ้นสุด</label>
      <input type="time" id="end-time" v-model="endTime" />

      <button v-if="loading === false" type="submit">ส่งคำขอลาการลา</button>

      <button v-if="loading === true" type="submit"><div class="spinner-border text-warning" role="status">
        <span class="sr-only">Loading...</span>
      </div></button>

    </form>
  </div>
</template>

<script>
const axios = require('axios');
import Swal from 'sweetalert2'
export default {
  props: {
    userData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      leaveCredits: [
        { label: 'สิทธิ์ลาป่วย', remaining: this.userData.totalSickLeave, total: this.userData.remainingSickLeave, class: 'sick-leave' },
        { label: 'สิทธิ์ลากิจ', remaining: this.userData.totalPersonalLeave, total: this.userData.remainingPersonalLeave, class: 'business-leave' },
        { label: 'สิทธิ์ลาพักร้อน', remaining: this.userData.totalVacationLeave, total: this.userData.remainingVacationLeave, class: 'vacation-leave' },
      ],
      leaveTypes: [
        { value: 'ลาป่วย', label: 'ลาป่วย' },
        { value: 'ลากิจ', label: 'ลากิจ' },
        { value: 'ลาพักร้อน', label: 'ลาพักร้อน' },
        { value: 'ลากิจพิเศษ', label: 'ลากิจพิเศษ' },
        { value: 'อุปสมบท', label: 'อุปสมบท' },
        { value: 'ลาคลอด', label: 'ลาคลอด' },
        { value: 'ลาไม่รับค่าจ้าง', label: 'ลาไม่รับค่าจ้าง' },
        { value: 'ลาหยุดพักผ่อนประจำปี', label: 'ลาหยุดพักผ่อนประจำปี' },
      ],
      selectedLeaveType: '',
      leaveReason: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      loading: false
    };
  },
  // ดึง userData มาจากหน้า HomePages
  props: ['userData'],
  methods: {

    async submitLeaveRequest() {

      this.loading = true;

      if (!this.selectedLeaveType || !this.leaveReason || !this.startDate || !this.endDate || !this.startTime || !this.endTime) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        }).then(() => {
          this.loading = false
        })
        return;
      }

      if (this.startDate > this.endDate) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'วันที่เริ่มลาต้องน้อยกว่าวันที่สิ้นสุด',
        }).then(() => {
          this.loading = false
        })
        return;
      }

      try {
        const data = JSON.stringify({
          type: this.selectedLeaveType,
          reason: this.leaveReason,
          startDate: this.startDate,
          endDate: this.endDate,
          startTime: this.startTime,
          endTime: this.endTime,
          sendDate: new Date(),
          lineId: localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')).userId : null,
          status: "รออนุมัติ",
          reasonText: " ",
          initialLeaveApprover: this.userData.initialLeaveApprover,
          finalLeaveApprover: this.userData.finalLeaveApprover
        });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.API_URL}/leave/createLeave`,
          headers: { 'Content-Type': 'application/json' },
          data: data
        };

        const response = await axios.request(config);

        // ส่งข้อความแจ้งเตือนการขออนุมัติ
        await this.sendNotification(response.data.lineId, "รออนุมัติ");

        // ส่งการแจ้งเตือนให้กับ initial และ final approver
        const { initialLeaveApprover, finalLeaveApprover } = this.userData;

        if (initialLeaveApprover) {
          await this.notifyApprover(initialLeaveApprover, "มีคำขอใหม่");
        }
        if (finalLeaveApprover) {
          await this.notifyApprover(finalLeaveApprover, "มีคำขอใหม่");
        }

        if (!initialLeaveApprover && !finalLeaveApprover) {
          alert('ไม่พบข้อมูลผู้อนุมัติ');
        } else {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'สำเร็จ',
          }).then(() => {
            this.loading = false;
            this.$router.push('/');
          })
        }
      } catch (error) {
        console.error('Error submitting leave request:', error);
      }
    },

    async notifyApprover(approverName, message) {
      try {
        const config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: `${process.env.API_URL}/users/getUserByName/${approverName}`,
          headers: {}
        };

        const response = await axios.request(config);

        if (response.data[0]?.lineId) {
          await this.sendNotification(response.data[0].lineId, message);
        }
      } catch (error) {
        console.error(`Error notifying ${approverName}:`, error);
      }
    },

    async sendNotification(lineId, message) {
      try {
        const data = JSON.stringify({ message: message });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.API_URL}/lineApi/sendImage/${lineId}`,
          headers: { 'Content-Type': 'application/json' },
          data: data
        };

        await axios.request(config);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }


  }
};
</script>

<style scoped>
.leave-form {
  padding: 20px;
}

.leave-credits {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.leave-credit {
  text-align: center;
  padding: 10px;
  border-radius: 10px;
  width: 100px;
  color: white;
}

.sick-leave {
  background-color: #ff8a80;
}

.business-leave {
  background-color: #ffeb3b;
}

.vacation-leave {
  background-color: #82b1ff;
}

.leave-request-form {
  display: flex;
  flex-direction: column;
}

.leave-request-form label {
  margin-top: 10px;
  margin-bottom: 5px;
}

.leave-request-form input,
.leave-request-form select {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
}

button {
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #6200ea;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #3700b3;
}
</style>