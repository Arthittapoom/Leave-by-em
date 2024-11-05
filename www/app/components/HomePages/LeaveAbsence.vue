<template>
  <div class="leave-form">
    <div class="leave-credits">
      <div v-for="(leave, index) in leaveCredits" :key="index" :class="['leave-credit', leave.class]">
        <div :class="[leave.class2]">{{ leave.remaining }}/{{ leave.total }}</div>
        <div class="leave-label">{{ leave.label }}</div>
      </div>
    </div>


    <form class="leave-request-form" @submit.prevent="submitLeaveRequest">
      <label for="leave-type">ประเภทการลา</label>
      <select id="leave-type" v-model="selectedLeaveType" @change="handleLeaveTypeChange">
        <option value="" disabled selected>เลือกประเภทการลา</option>
        <option v-for="(leave, index) in leaveTypes" :key="index" :value="leave.value">
          {{ leave.label }}
        </option>
      </select>


      <label
        v-if="selectedLeaveTypeData && selectedLeaveTypeData.advanced !== '-' && selectedLeaveTypeData.status === 'true'"
        for="leave-advanced">ต้องลาล่วงหน้า</label>
      <input
        v-if="selectedLeaveTypeData && selectedLeaveTypeData.advanced !== '-' && selectedLeaveTypeData.status === 'true'"
        type="text" id="leave-advanced" v-model="selectedLeaveTypeData.advanced" placeholder=" " disabled />


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

      <label v-if="selectedLeaveTypeData" for="upload-image">อัพโหลดรูปภาพ
        ({{ selectedLeaveTypeData.evidenceRequired }})</label>
      <label v-if="!selectedLeaveTypeData" for="upload-image">อัพโหลดรูปภาพ
        (ไม่บังคับ)</label>
      <input type="file" id="upload-image" @change="handleFileUpload" />

      <!-- เพิ่มส่วนแสดงภาพที่อัพโหลด -->
      <div class="uploaded-image" v-if="imageUrl || imageBase64">
        <img :src="imageBase64" alt="รูปภาพที่แปลงกลับจาก Base64" width="200" />
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
        {
          label: 'สิทธิ์ลาป่วย',
          remaining: this.userData.totalSickLeave,
          total: this.LeaveTypesGet && this.LeaveTypesGet[0] ? this.LeaveTypesGet[0].days : 0,
          class: 'sick-leave',
          class2: 'leave-number1'
        },
        {
          label: 'สิทธิ์ลากิจ',
          remaining: this.userData.totalPersonalLeave,
          total: this.userData.remainingPersonalLeave,
          class: 'personal-leave',
          class2: 'leave-number2'
        },
        {
          label: 'สิทธิ์ลาพักร้อน',
          remaining: this.userData.totalVacationLeave,
          total: this.userData.remainingVacationLeave,
          class: 'vacation-leave',
          class2: 'leave-number3'
        },
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
      imageBase64: '', // เก็บ Base64 string ของรูปภาพ

      selectedLeaveTypeData: null,

      LeaveTypesGet: null,
    };
  },

  mounted() {
    this.getLeaveTypes();
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
      this.uploadImage();  // อัพโหลดไฟล์ทันทีเมื่อมีการเลือกไฟล์
    },
    showImage(base64String) {
      this.imageBase64 = base64String; // ใช้ Base64 string ที่เก็บไว้เพื่อแสดงรูป
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

    handleLeaveTypeChange(event) {
      // console.log(event.target.value); // แสดงค่าที่เลือก

      const axios = require('axios');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/Leave/getLeaveTypeByLabel/' + event.target.value,
        headers: {}
      };

      axios.request(config)
        .then((response) => {
          // console.log(response.data);
          this.selectedLeaveTypeData = response.data;
        })
        .catch((error) => {
          console.log(error);
        });

    },

    getLeaveTypes() {
      const axios = require('axios');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/Leave/getLeaveTypes',
        headers: {}
      };

      axios.request(config)
        .then((response) => {
          // console.log(response.data);
          this.LeaveTypesGet = response.data;

          // Now update leaveCredits with the fetched data
          this.leaveCredits = [
            {
              label: 'สิทธิ์ลาป่วย',
              remaining: this.userData.totalSickLeave,
              total: this.LeaveTypesGet[0].days,
              class: 'sick-leave',
              class2: 'leave-number1'
            },
            {
              label: 'สิทธิ์ลากิจ',
              remaining: this.userData.totalPersonalLeave,
              total: this.LeaveTypesGet[3].days,
              class: 'personal-leave',
              class2: 'leave-number2'
            },
            {
              label: 'สิทธิ์ลาพักร้อน',
              remaining: this.userData.totalVacationLeave,
              total: this.LeaveTypesGet[2].days,
              class: 'vacation-leave',
              class2: 'leave-number3'
            },
          ];
        })
        .catch((error) => {
          console.log(error);
        });
    },

    subtractDays(advanced, startDate) {
      const date = new Date(startDate); // แปลง startDate เป็น Date object

      // ลบจำนวนวันที่กำหนด (advanced)
      date.setDate(date.getDate() - advanced);

      // จัดรูปแบบวันที่ใหม่เป็น YYYY-MM-DD
      const resultYear = date.getFullYear();
      const resultMonth = String(date.getMonth() + 1).padStart(2, '0'); // เดือนใน JavaScript เริ่มที่ 0
      const resultDay = String(date.getDate()).padStart(2, '0');

      // ส่งคืนวันที่ใหม่ในรูปแบบ YYYY-MM-DD
      return `${resultYear}-${resultMonth}-${resultDay}`;
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

      const axios = require('axios');
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/Leave/getLeaveTypeByLabel/' + this.selectedLeaveType,
        headers: {}
      };

      await axios.request(config)
        .then((response) => {
          // console.log(response.data);
          this.selectedLeaveTypeData = response.data;

        })
        .catch((error) => {
          console.log(error);
        });


      if (this.selectedLeaveTypeData.advanced !== '-' && this.selectedLeaveTypeData.status === 'true') {

        // console.log(this.selectedLeaveTypeData.advanced, this.startDate);
        const result = await this.subtractDays(this.selectedLeaveTypeData.advanced, this.startDate);
        const formattedDate = new Date(2024, 9, 6).toISOString().split('T')[0];
        // console.log(result , formattedDate);

        if (String(result) > String(formattedDate)) {
          Swal.fire('ต้องลาก่อน ' + result + ' วัน', '', 'error').then(() => {
            this.loading = false;
          });
          return;
        }
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
          imageUrl: this.imageBase64 || 'null',
        };

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.API_URL}/leave/createLeave`,
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify(data)
        };

        const response = await axios.request(config);



        // ส่งข้อมูลการขออนุมัติ

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
.uploaded-image {
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
  gap: 5px;
  justify-content: center;
  margin-top: 0px;
}

.leave-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 140px;
  border-radius: 15px;
  color: white;
  font-family: 'Arial', sans-serif;
}

.sick-leave {
  background-color: #FF8A80; /* Light red */
}

.personal-leave {
  background-color: #FFD180; /* Light yellow-orange */
}

.vacation-leave {
  background-color: #80D8FF; /* Light blue */
}

.leave-number1 {
  background-color: #FF7070;
  padding: 20px;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}

.leave-number2 {
  background-color: #BBC361;
  padding: 20px;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
}

.leave-number3 {
  background-color: #405CA3;
  padding: 20px;
  border-radius: 50%;
  font-size: 24px;
  font-weight: bold;
}

.leave-label {
  margin-top: 10px;
  font-size: 16px;
}

.leave-request-form {
  display: flex;
  flex-direction: column;
  width: 320px;
  margin: 0 auto;
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
}

button:hover {
  background-color: #3700b3;
}
</style>
