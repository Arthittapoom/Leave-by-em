<template>
  <div class="upload-container">
    <h2>Upload File</h2>
    <input type="file" @change="handleFileUpload" />
    <button @click="uploadFile">Upload</button>
    <div v-if="uploadStatus" class="status-message">{{ uploadStatus }}</div>

    <div class="leave-container">
      <h3>Leave Details</h3>
      <div v-for="(leaveType, index) in leaveData" :key="index" class="leave-item">
        <span class="leave-label">{{ leaveType.label }}:</span>
        <input type="number" v-model="leaveType.days" class="leave-input" />
        <span>วัน/ปี</span>
        <span class="leave-description">{{ leaveType.description }}:</span>
        <input type="number" v-model="leaveType.extraDays" class="leave-input" />
        <span>วัน/ปี</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      leaveData: [
        { label: 'ลาป่วย', days: 30, description: 'ลาราชการทหาร', extraDays: '-' },
        { label: 'ลากิจ', days: 6, description: 'ลาอุปสมบท', extraDays: '-' },
        { label: 'ลากิจ(พิเศษ)', days: '-', description: 'ลาหยุดพักผ่อนประจำปี', extraDays: 6 },
        { label: 'ลาคลอด', days: 98, description: 'ลาไม่รับค่าจ้าง', extraDays: '-' },
      ],
      selectedFile: null,
      uploadStatus: ''
    };
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0];
    },
    uploadFile() {
      if (!this.selectedFile) {
        this.uploadStatus = 'กรุณาเลือกไฟล์ก่อน';
        return;
      }

      const formData = new FormData();
      formData.append('files', this.selectedFile);

      const config = {
        method: 'post',
        url: process.env.API_URL + '/master/migrate-data',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formData
      };

      axios.request(config)
        .then((response) => {
          this.uploadStatus = 'อัปโหลดไฟล์สำเร็จ!';
          console.log(response.data);
        })
        .catch((error) => {
          this.uploadStatus = 'การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่';
          console.error(error);
        });
    }
  }
};
</script>

<style scoped>
.upload-container {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  /* border: 1px solid #ccc; */
  border-radius: 10px;
  /* background-color: #f9f9f9; */
}

h2 {
  font-family: 'Arial', sans-serif;
  color: #333;
}

input[type="file"] {
  margin: 10px 0;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}

.status-message {
  margin-top: 10px;
  font-size: 14px;
  color: #d9534f;
}

.leave-container {
  margin-top: 20px;
}

.leave-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.leave-label, .leave-description {
  margin-right: 20px;
  margin-left: 20px;
  font-weight: bold;
  width: 120px;
}

.leave-input {
  width: 60px;
  margin: 0 10px;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
