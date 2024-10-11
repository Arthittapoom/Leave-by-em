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

    <label for="upload-image">อัพโหลดรูปภาพ</label>
    <input type="file" id="upload-image" @change="handleFileUpload" />

    <!-- เพิ่มส่วนแสดงภาพที่อัพโหลด -->
    <div class="uploaded-image" v-if="imageUrl || imageBase64">
        <img :src="imageBase64" alt="รูปภาพที่แปลงกลับจาก Base64" width="200" />
      </div>

    <button v-if="loading === false" type="button" @click="submitForm">ส่งคำขอการปฏิบัติงานนอกสถานที่</button>
    <button v-if="loading === true" type="submit">
      <div class="spinner-border text-warning" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </button>
  </div>
</template>

<script>
import Swal from 'sweetalert2'
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
      endTime: '',
      loading: false,
      selectedFile: null,
      imageUrl: '',
      imageBase64: '', // เก็บ Base64 string ของรูปภาพ
    };
  },
  props: ['userData'],
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

      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result; // เก็บ Base64 string
        this.imageBase64 = base64String; // ตั้งค่า imageBase64 สำหรับแสดงภาพ
        this.imageUrl = base64String; // อัปเดต imageUrl ด้วย Base64 string
        Swal.fire('แปลงรูปภาพเป็น Base64 สำเร็จ', '', 'success');
        // console.log(base64String); // ใช้ base64String นี้เก็บหรือส่งไปยัง API
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        Swal.fire('เกิดข้อผิดพลาดในการอ่านไฟล์', '', 'error');
      };

      reader.readAsDataURL(this.selectedFile); // แปลงไฟล์รูปเป็น Base64
    },
    async submitForm() {
      this.loading = true;
      try {

        if (this.startDate > this.endDate) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'วันที่เริ่มต้องน้อยกว่าวันที่สิ้นสุด'
          }).then(() => {
            this.loading = false
          })
          return;
        }

        if (!this.userData) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณาเข้าสู่ระบบ'
          }).then(() => {
            this.loading = false
          })
          return;
        }

        if (!this.workLocation || !this.vehicle || !this.vehicleNumber || !this.startDate ||
          !this.endDate || !this.startTime || !this.endTime) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณากรอกข้อมูลให้ครบถ้วน'
          }).then(() => {
            this.loading = false
          })
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
          type: 'ออกปฏิบัติงานนอกสถานที่',
          imageUrl: this.imageBase64
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
          Swal.fire({
            icon: 'success',
            title: 'ส่งคำขอสําเร็จ',
            text: 'ส่งคำขอสําเร็จแล้ว'
          }).then(() => {
            this.loading = false
            this.$router.push('/');
          })
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
.uploaded-image{
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

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
  width: 100%;
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