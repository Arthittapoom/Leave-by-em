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

      <button type="submit">ส่งคำขอลาการลา</button>
    </form>
  </div>
</template>

<script>
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
        { label: 'สิทธิ์ลาพักร้อน', remaining: this.userData.remainingVacationLeave, total: this.userData.grantedVacationLeave, class: 'vacation-leave' },
      ],
      leaveTypes: [
        { value: 'sick-leave', label: 'ลาป่วย' },
        { value: 'business-leave', label: 'ลากิจ' },
        { value: 'vacation-leave', label: 'ลาพักร้อน' },
        { value: 'special-business-leave', label: 'ลากิจพิเศษ' },
        { value: 'ordination-leave', label: 'อุปสมบท' },
        { value: 'maternity-leave', label: 'ลาคลอด' },
        { value: 'unpaid-leave', label: 'ลาไม่รับค่าจ้าง' },
        { value: 'annual-leave', label: 'ลาหยุดพักผ่อนประจำปี' },
      ],
      selectedLeaveType: '',
      leaveReason: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    };
  },
  methods: {
    submitLeaveRequest() {

      // Implement submission logic here
      // console.log('Leave request submitted:', {
      //   type: this.selectedLeaveType,
      //   reason: this.leaveReason,
      //   startDate: this.startDate,
      //   endDate: this.endDate,
      //   startTime: this.startTime,
      //   endTime: this.endTime,
      //   sendDate: new Date(),
      //   lineId: localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')).userId : null,
      // });

      const axios = require('axios');
      let data = JSON.stringify({
        "type": this.selectedLeaveType,
        "reason": this.leaveReason,
        "startDate": this.startDate,
        "endDate": this.endDate,
        "startTime": this.startTime,
        "endTime": this.endTime,
        "sendDate": new Date(),
        "lineId": localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')).userId : null,
        "status": "รออนุมัติ"
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.API_URL+'/leave/createLeave',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios.request(config)
        .then((response) => {
          // console.log(JSON.stringify(response.data));
          alert('ส่งคำขอลาเรียบร้อย');
          this.$router.push('/');
        })
        .catch((error) => {
          console.log(error);
        });

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