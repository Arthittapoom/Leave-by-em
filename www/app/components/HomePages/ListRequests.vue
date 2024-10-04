<template>
  <div class="request-list">
    <h3>รายการคำขอทั้งหมด</h3>
    <div style="height: 300px;" v-if="!requests.length">
      <p>ไม่มีรายการคำขอ</p>
    </div>
    <div v-if="requests.length" class="request-item" v-for="(request, index) in requests" :key="index">
      <div class="request-icon">
        <div class="icon-number">{{ index + 1 }}</div>
      </div>
      <div class="request-details">
        <div class="request-name">{{ request.type }}</div>
        <div class="request-date-time">{{ request.startDate }} | {{ request.startTime }}</div>
      </div>
      <div class="request-reason">{{ request.reason }}</div>
      <button class="details-button" @click="openModal(request)">รายละเอียด</button>
    </div>

    <!-- Modal -->

    <div v-if="selectedRequest" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h3>รายละเอียดคำขอ</h3>
        <p><strong>ชื่อ-นามสกุล:</strong> {{ selectedRequest.name }}</p>
        <p><strong>รหัสพนักงาน:</strong> {{ selectedRequest.code }}</p>
        <p><strong>ตำแหน่ง:</strong> {{ selectedRequest.position }}</p>
        <div class="flex-container">
          <p><strong>สังกัด:</strong> {{ selectedRequest.department }}</p>
          <p><strong>สถานที่ปฏิบัติงาน:</strong> {{ selectedRequest.workplace }}</p>
        </div>
        <div class="flex-container">
          <p><strong>อายุงาน:</strong> {{ selectedRequest.diffDays_days }}</p>
          <p><strong>เบอร์โทรศัพท์:</strong> {{ selectedRequest.phone }}</p>
        </div>
        <p><strong>ประเภทการลา/เหตุผลการลา:</strong> {{ selectedRequest.reason }}</p>
        <p><strong>วัน/เดือน/ปี ที่ต้องการลา:</strong> {{ selectedRequest.startDate }} - {{ selectedRequest.endDate }}
        </p>
        <p><strong>เวลา ที่ต้องการลา:</strong> {{ selectedRequest.startTime }} - {{ selectedRequest.endTime }}</p>
        <div class="approval">
          <label><input type="radio" name="approval" value="อนุมัติ" v-model="selectedRequest.status" /> อนุมัติ</label>
          <label><input type="radio" name="approval" value="ไม่อนุมัติ" v-model="selectedRequest.status" />
            ไม่อนุมัติ</label>

        </div>
        <label for="remark">หมายเหตุ:</label>
        <textarea id="remark" rows="4" v-model="selectedRequest.reasonText"></textarea>
        <button @click="updateLeave(selectedRequest)" class="submit-button">ยืนยัน</button>
        <div class="submit-button-b"> </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  data() {
    return {
      requests: [],
      selectedRequest: null
    };
  },
  props: ['userData'],
  methods: {
    openModal(request) {
      // this.selectedRequest = request;

      // console.log(request.lineId);

      const axios = require('axios');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/users/getUserByLineId/' + request.lineId,
        headers: {}
      };

      axios.request(config)
        .then((response) => {
          // console.log(response.data);

          this.selectedRequest = {
            ...response.data,
            ...request
          }

          // console.log(this.selectedRequest);
        })
        .catch((error) => {
          console.log(error);
        });

    },
    updateLeave(datas) {
      this.selectedRequest = datas;
      // console.log(this.selectedRequest._id);
      const axios = require('axios');

      // ฟังก์ชันสำหรับการเพิ่มจำนวนวันลา
      const incrementLeave = async (lineId, leaveType, apiField) => {
        try {
          // ดึงข้อมูลผู้ใช้
          let getConfig = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${process.env.API_URL}/users/getUserByLineId/${lineId}`,
            headers: { 'Content-Type': 'application/json' }
          };

          const userResponse = await axios.request(getConfig);
          let currentLeaveCount = parseInt(userResponse.data[apiField]) || 0;

          // บวกเพิ่ม 1
          let updatedLeaveCount = currentLeaveCount + 1;
          let data = JSON.stringify({ [apiField]: updatedLeaveCount });

          // อัปเดตข้อมูลวันลา
          let updateConfig = {
            method: 'put',
            maxBodyLength: Infinity,
            url: `${process.env.API_URL}/users/updateUserByLineId/${lineId}`,
            headers: { 'Content-Type': 'application/json' },
            data: data
          };

          const updateResponse = await axios.request(updateConfig);
          // console.log(updateResponse.data[apiField]);
        } catch (error) {
          console.error(error);
        }
      };

      if (this.selectedRequest.status === 'อนุมัติ') {
        // เช็คประเภทของการลาและอัปเดตตามประเภทนั้นๆ
        switch (this.selectedRequest.type) {
          case 'ลาป่วย':
            incrementLeave(this.selectedRequest.lineId, 'ลาป่วย', 'totalSickLeave');
            break;
          case 'ลากิจ':
            incrementLeave(this.selectedRequest.lineId, 'ลากิจ', 'totalPersonalLeave');
            break;
          case 'ลาพักร้อน':
            incrementLeave(this.selectedRequest.lineId, 'ลาพักร้อน', 'totalVacationLeave');
            break;
          case 'ลากิจพิเศษ':
          case 'อุปสมบท':
          case 'ลาคลอด':
          case 'ลาไม่รับค่าจ้าง':
            incrementLeave(this.selectedRequest.lineId, 'ลาอื่นๆ', 'totalUnpaidLeave');
            break;
          default:
            console.log('ไม่พบประเภทการลา');
        }
      }

      // อัปเดตสถานะการลา
      let data = JSON.stringify({
        "status": this.selectedRequest.status,
        "reasonText": this.selectedRequest.reasonText || null
      });

      let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: `${process.env.API_URL}/leave/updateLeave/${this.selectedRequest._id}`,
        headers: { 'Content-Type': 'application/json' },
        data: data
      };

      axios.request(config)
        .then((response) => {
          // console.log(response.data);
          alert('บันทึกสำเร็จ');
          const status = response.data.status;

          // ฟังก์ชันสำหรับส่งการแจ้งเตือนผ่าน LINE API
          const sendLineNotification = (message) => {
            let lineData = JSON.stringify({ "message": message });
            let lineConfig = {
              method: 'post',
              maxBodyLength: Infinity,
              url: `${process.env.API_URL}/lineApi/sendImage/${this.selectedRequest.lineId}`,
              headers: { 'Content-Type': 'application/json' },
              data: lineData
            };
            axios.request(lineConfig)
              .then((response) => console.log())
              .catch((error) => console.log(error));
          };

          if (status === 'อนุมัติ') {
            sendLineNotification('อนุมัติ');
          } else if (status === 'ไม่อนุมัติ') {
            sendLineNotification('ไม่อนุมัติ');
          }

          this.selectedRequest = null;
        })
        .catch((error) => console.log(error));
    },
    getLeavesByApprover(approver) {
      const axios = require('axios');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/leave/getLeavesByApprover/' + approver,
        headers: {}
      };

      axios.request(config)
        .then((response) => {
          // ตรวจสอบว่าข้อมูลมีอยู่และเป็น array
          if (Array.isArray(response.data)) {
            // เรียงข้อมูลตาม sendDate จากล่าสุดไปเก่าสุด
            this.requests = response.data.sort((a, b) => {
              return new Date(b.sendDate) - new Date(a.sendDate); // เรียงจากมากไปน้อย (ล่าสุดไปเก่าสุด)
            });
          } else {
            // console.log('Unexpected data format:', response.data);
          }
          // console.log(this.requests);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    closeModal() {
      this.selectedRequest = null;
    }

  },
  mounted() {

    // console.log(this.userData.name);
    this.getLeavesByApprover(this.userData.name);
    // this.getLeavesByApprover("ผู้อนุมัติ เบื้องต้น");

  }
};
</script>

<style scoped>
.request-list {
  padding: 20px;
}

.request-item {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.request-icon {
  margin-right: 10px;
}

.icon-number {
  width: 30px;
  height: 30px;
  background-color: red;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
}

.request-details {
  flex-grow: 1;
}

.request-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.request-date-time {
  color: #999;
  font-size: 14px;
}

.request-reason {
  margin-right: 20px;
  font-size: 14px;
}

.details-button {
  background-color: #ffeb3b;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
}

.details-button:hover {
  background-color: #fdd835;
}

/* Modal Styles */
/* Modal Styles */
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 100%;
  /* ปรับให้กว้างเต็มจอ */
  height: 100%;
  /* ปรับให้สูงเต็มจอ */
  border-radius: 0;
  /* ลบขอบมุมโค้ง */
}


.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.approval {
  display: flex;
  margin-top: 10px;
}

.approval label {
  margin-right: 10px;
}

textarea {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.submit-button {
  margin-top: 20px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #6200ea;
  color: white;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
}

.submit-button-b {
  height: 150px;
}

.submit-button:hover {
  background-color: #3700b3;
}

/* Add this to your existing CSS */
.flex-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.flex-container p {
  flex: 1;
  margin-right: 20px;
  white-space: nowrap;
}
</style>