<template>
  <div class="leave-form">
    <div class="leave-credits">
      <div v-for="(leave, index) in leaveCredits" :key="index" :class="['leave-credit', leave.class]">
        <div>วัน</div>
        <div>{{ leave.remaining }}/{{ leave.total }}</div>
        <div>{{ leave.label }}</div>
      </div>
    </div>

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

      <label for="upload-image">อัพโหลดรูปภาพ</label>
      <input type="file" id="upload-image" @change="handleFileUpload" />

      <!-- เพิ่มส่วนแสดงภาพที่อัพโหลด -->
      <div class="uploaded-image" v-if="imageUrl">
        <!-- <label>รูปภาพที่อัพโหลด:</label> -->
        <img :src="imageUrl" alt="Uploaded image" width="200" />
      </div>

      <button v-if="loading === false" type="submit">ส่งคำขอลาการลา</button>

      <button v-if="loading === true" type="submit">
        <div class="spinner-border text-warning" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </button>
    </form>
  </div>
</template>

<script>
const axios = require('axios');
import Swal from 'sweetalert2';

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
      loading: false,
      selectedFile: null,
      imageUrl: '',

    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      this.uploadImage();  // อัพโหลดไฟล์ทันทีเมื่อมีการเลือกไฟล์
    },
    async uploadImage() {
      if (!this.selectedFile) {
        Swal.fire('กรุณาเลือกไฟล์ก่อนอัปโหลด');
        return;
      }
      
      let formData = new FormData();
      formData.append('image', this.selectedFile);

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/master/upimg',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: formData
      };

      try {
        const response = await axios.request(config);
        this.imageUrl = process.env.API_URL + '/' + response.data.filePath;
        Swal.fire('อัปโหลดรูปภาพสำเร็จ', response.data.message, 'success');
      } catch (error) {
        console.error('Error uploading image:', error);
        Swal.fire('เกิดข้อผิดพลาดในการอัปโหลด', '', 'error');
      }
    },
    
    async submitLeaveRequest() {
      this.loading = true;

      if (!this.selectedLeaveType || !this.leaveReason || !this.startDate || !this.endDate || !this.startTime || !this.endTime) {
        Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'error').then(() => {
          this.loading = false;
        });
        return;
      }

      if (this.startDate > this.endDate) {
        Swal.fire('วันที่เริ่มลาต้องน้อยกว่าวันที่สิ้นสุด', '', 'error').then(() => {
          this.loading = false;
        });
        return;
      }

      try {
        const data = {
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
          finalLeaveApprover: this.userData.finalLeaveApprover,
          imageUrl: this.imageUrl
        };

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.API_URL}/leave/createLeave`,
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify(data)
        };

        const response = await axios.request(config);
        Swal.fire('สำเร็จ', 'คำขอลาการลาของคุณถูกส่งเรียบร้อยแล้ว', 'success').then(() => {
          this.loading = false;
          this.$router.push('/');
        });

      } catch (error) {
        console.error('Error submitting leave request:', error);
      }
    }
  }
};
</script>


<style scoped>
.uploaded-image{
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

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
