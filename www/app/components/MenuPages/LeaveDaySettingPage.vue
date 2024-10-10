<template>
  <div class="upload-container scrollable-content">
    <div class="upload-box">
      <!-- <p>Drag and drop to upload</p> -->
      <!-- <p>(Up to 10MB)</p> -->
      <input type="file" id="file-upload" @change="handleFileUpload" />
      <button @click="uploadFile" class="upload-btn">อัพโหลดไฟล์</button>
    </div>

    <table class="leave-table">
      <thead>
        <tr>
          <th>ประเภทการลา</th>
          <th>สิทธิ์การลา</th>
          <th>ล่วงหน้า</th>
          <th>ต้องมีหลักฐาน</th>
          <th>สถานะการใช้งาน</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(leaveType, index) in leaveData" :key="index">
          <td>{{ leaveType.label }}</td>
          <td><input class="days-input" type="text" v-model="leaveType.days" /> วัน/ปี</td>
          <td><input class="days-input" type="text" v-model="leaveType.advanced" /></td>
          <td><input class="days-input" type="text" v-model="leaveType.evidenceRequired" /></td>
          <td>
            <label class="switch">
              <input type="checkbox" v-model="leaveType.status" />
              <span class="slider round"></span>
            </label>
          </td>
        </tr>
      </tbody>
    </table>

    <button @click="saveSettings" class="save-btn">บันทึก</button>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
export default {
  data() {
    return {
      leaveData: [
        { label: 'ลาป่วย', days: 30, advanced: '-', evidenceRequired: 'มีหลักฐาน', status: false },
        { label: 'ลากิจ', days: 6, advanced: 3, evidenceRequired: 'มีหลักฐาน', status: true },
        { label: 'ลาพักร้อน', days: 6, advanced: '-', evidenceRequired: 'มีหลักฐาน', status: false },
        { label: 'ลากิจพิเศษ', days: '-', advanced: '-', evidenceRequired: '-', status: false },
        { label: 'ลาอุปสมบท', days: '-', advanced: '-', evidenceRequired: '-', status: false },
        { label: 'ลาคลอด', days: 30, advanced: '-', evidenceRequired: 'มีหลักฐาน', status: false },
        { label: 'ลาไม่รับค่าจ้าง', days: '-', advanced: '-', evidenceRequired: '-', status: false },
        { label: 'ลาหยุดพักผ่อนประจำปี', days: '-', advanced: 3, evidenceRequired: 'มีหลักฐาน', status: true },
      ],
      selectedFile: null,
      uploadStatus: '',
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
          // console.log(response.data);

          Swal.fire({
            icon: 'success',
            title: 'อัปโหลดไฟล์สำเร็จ!',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
            willClose: () => {
              this.$router.go();
            }
          })
        })
        .catch((error) => {
          this.uploadStatus = 'การอัปโหลดไฟล์ล้มเหลว กรุณาลองใหม่';
          console.error(error);
        });

    },
    saveSettings() {
      this.leaveData.forEach(element => {

        const dataNew = {
          advanced: element.advanced,
          days: String(element.days),
          evidenceRequired: element.evidenceRequired,
          label: element.label,
          status: String(element.status),
        }

        // console.log(dataNew)

        const axios = require('axios');
        let data = JSON.stringify({
          "advanced": dataNew.advanced,
          "days": dataNew.days,
          "evidenceRequired": dataNew.evidenceRequired,
          "label": dataNew.label,
          "status": dataNew.status
        });

        let config = {
          method: 'put',
          maxBodyLength: Infinity,
          url:  process.env.API_URL + '/Leave/updateLeaveTypeByLabel/' + dataNew.label,
          headers: {
            'Content-Type': 'application/json'
          },
          data: data
        };

        axios.request(config)
          .then((response) => {
            Swal.fire({
              icon: 'success',
              title: 'บันทึกสำเร็จ',
              showConfirmButton: false,
              timer: 1500
            })
            // console.log(JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log(error);
          });



      });
    },
  },
};
</script>


<style scoped>
.upload-container {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  text-align: center;

}

.upload-box {
  border: 2px dashed #b83ba3;
  padding: 20px;
  margin-bottom: 20px;
  position: relative;
  border-radius: 15px;
}

/* #file-upload {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
} */

.upload-btn {
  background-color: #d6b0e8;
  border: none;
  color: white;
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
  border-radius: 5px;
}

.upload-btn:hover {
  background-color: #b28ac2;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  border: none;
}

.leave-table th,
.leave-table td {
  border: none;
  padding: 8px;
  text-align: center;
}

.days-input {
  width: 100px;
  text-align: center;
  border-radius: 10px;
  border: 1px solid #ffd0f7;
}

.save-btn {
  background-color: #b28ac2;
  border: none;
  color: white;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
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

.save-btn:hover {
  background-color: #8a6d9f;
}

.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
}

input:checked+.slider {
  background-color: #2196F3;
}

input:checked+.slider:before {
  transform: translateX(14px);
}
</style>
