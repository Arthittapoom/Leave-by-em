<template>
  <div class="leave-outside-form">
    <label for="work-location">สถานที่ปฏิบัติงาน</label>
    <input type="text" id="work-location" v-model="workLocation" placeholder="ระบุสถานที่ปฏิบัติงาน" />

    <label for="vehicle">รถที่ใช้ออกปฏิบัติงาน</label>
    <input type="text" id="vehicle" v-model="vehicle" placeholder="ระบุรถที่ใช้ออกปฏิบัติงาน" />

    <label for="vehicle-number">เลขทะเบียนรถ</label>
    <input type="text" id="vehicle-number" v-model="vehicleNumber" placeholder="ระบุเลขทะเบียนรถ" />

    <label for="start-date">วันที่เริ่ม</label>
    <input type="date" id="date" v-model="startDate" />

    <label for="end-date">วันที่สิ้นสุด</label>
    <input type="date" id="date" v-model="endDate" />

    <label for="start-time">เวลาเริ่มออกปฏิบัติงาน</label>
    <input type="time" id="start-time" v-model="startTime" />

    <label for="end-time">เวลาเสร็จสิ้น</label>
    <input type="time" id="end-time" v-model="endTime" />

    <button type="button" @click="submitForm">ส่งคำขอการปฏิบัติงานนอกสถานที่</button>
  </div>
</template>

<script>
const axios = require('axios');
export default {
  data() {
    return {
      workLocation: '',
      vehicle: '',
      vehicleNumber: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: ''
    };
  },
  props: ['userData'],
  methods: {
    async submitForm() {
      try {
        // ตรวจสอบข้อมูลเบื้องต้น
        if (this.startDate > this.endDate) {
          alert('วันที่สิ้นสุดต้องมากกว่าวันที่เริ่ม');
          return;
        }

        // if (this.startTime > this.endTime) {
        //   alert('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม');
        //   return;
        // }

        if (!this.userData) {
          alert('กรุณาเข้าสู่ระบบก่อน');
          return;
        }

        if (!this.workLocation || !this.vehicle || !this.vehicleNumber || !this.startDate ||
          !this.endDate || !this.startTime || !this.endTime) {
          alert('กรุณากรอกข้อมูลให้ครบ');
          return;
        }

        // เตรียมข้อมูลสำหรับส่งไปยัง API
        const data = JSON.stringify({
          userId: this.userData.id,
          lineId: localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')).userId : null,
          workLocation: this.workLocation,
          vehicle: this.vehicle,
          vehicleNumber: this.vehicleNumber,
          startDate: this.startDate,
          endDate: this.endDate,
          startTime: this.startTime,
          endTime: this.endTime,
          status: 'รออนุมัติ',
          sendDate: new Date(),
          initialLeaveApprover: this.userData.initialLeaveApprover,
          finalLeaveApprover: this.userData.finalLeaveApprover,
          type: 'ออกปฏิบัติงานนอกสถานที่'
        });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.API_URL}/LeaveOutside/createLeaveOutside`,
          headers: { 'Content-Type': 'application/json' },
          data: data
        };

        // ส่งข้อมูลการขออนุมัติ
        const response = await axios.request(config);
        // console.log(response.data);

        // ส่งข้อความแจ้งเตือนผู้อนุมัติ
        await this.sendNotification(response.data.lineId, 'รออนุมัติ');

        const { initialLeaveApprover, finalLeaveApprover } = this.userData;

        // แจ้งเตือนผู้อนุมัติเริ่มต้น (initialLeaveApprover)
        if (initialLeaveApprover) {
          await this.notifyApprover(initialLeaveApprover, 'มีคำขอใหม่');
        }

        // แจ้งเตือนผู้อนุมัติสุดท้าย (finalLeaveApprover)
        if (finalLeaveApprover) {
          await this.notifyApprover(finalLeaveApprover, 'มีคำขอใหม่');
        }

        if (!initialLeaveApprover && !finalLeaveApprover) {
          alert('ไม่พบข้อมูลผู้อนุมัติ');
        } else {
          alert('บันทึกสำเร็จ');
          this.$router.push('/');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
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
.leave-outside-form {
  display: flex;
  flex-direction: column;
  width: 300px;
}

.leave-outside-form label {
  margin-top: 10px;
  margin-bottom: 5px;
}

.leave-outside-form input[type="text"],
.leave-outside-form input[type="date"],
.leave-outside-form input[type="time"] {
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
  margin-top: 10px;
}

button:hover {
  background-color: #3700b3;
}
</style>