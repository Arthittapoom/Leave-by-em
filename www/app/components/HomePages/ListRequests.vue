<template>
  <div>
    <div v-if="loadingData === true" class="spinner-border text-warning" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-if="loadingData === false" class="request-list">
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
          <div v-if="request.Type === 'ลาออก'" class="request-name">{{ request.Type }}</div>
          <div v-if="request.Type !== 'ลาออก'" class="request-date-time">{{ request.startDate }} | {{ request.startTime
            }}
          </div>
        </div>
        <div class="request-reason">{{ request.reason }}</div>
        <button class="details-button" @click="openModal(request)">รายละเอียด</button>
      </div>

      <!-- Modal -->

      <div v-if="selectedRequest" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h3>รายละเอียดคำขอ</h3>
          <div class="flex-container">
            <p><strong>ชื่อ:</strong> {{ selectedRequest.name }}</p>
            <p><strong>รหัสพนักงาน:</strong> {{ selectedRequest.code }}</p>
            <p><strong>ตำแหน่ง:</strong> {{ selectedRequest.position }}</p>
          </div>
          <div class="flex-container">
            <p><strong>สังกัด:</strong> {{ selectedRequest.department }}</p>
            <p><strong>สถานที่ปฏิบัติงาน:</strong> {{ selectedRequest.workplace }}</p>
            <p><strong>อายุงาน:</strong> {{ selectedRequest.diffDays_days }}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> {{ selectedRequest.phone }}</p>
          </div>
          <p v-if="selectedRequest.Type !== 'ลาออก'"><strong>ประเภทการลา/เหตุผลการลา:</strong> {{ selectedRequest.reason
            }}</p>
          <p v-if="selectedRequest.Type !== 'ลาออก'"><strong>วัน/เดือน/ปี ที่ต้องการลา:</strong> {{
            selectedRequest.startDate }} - {{ selectedRequest.endDate }}
          </p>
          <p v-if="selectedRequest.Type !== 'ลาออก'"><strong>เวลา ที่ต้องการลา:</strong> {{ selectedRequest.startTime }}
            -
            {{ selectedRequest.endTime }}</p>

          <!-- เพิ่มรายละเอียดการออกปฏิบัติงานนอกสถานที่ -->
          <div v-if="selectedRequest.type === 'ออกปฏิบัติงานนอกสถานที่'">
            <div class="flex-container">
              <p><strong>สถานที่:</strong> {{ selectedRequest.workLocation }}</p>
              <p><strong>ยานพาหนะ:</strong> {{ selectedRequest.vehicle }}</p>
            </div>

            <p><strong>หมายเลข:</strong> {{ selectedRequest.vehicleNumber }}</p>
          </div>
          <!-- เพิ่มรายละเอียดการลาออก -->
          <div v-if="selectedRequest.Type === 'ลาออก'">
            <p><strong>วันที่เริ่มงาน:</strong> {{ selectedRequest.firstWorkDay }}</p>
            <p><strong>วันที่สิ้นสุดงาน:</strong> {{ selectedRequest.lastWorkDay }}</p>
            <p><strong>ต้องการใบรับรอง:</strong> {{ selectedRequest.needsCertification ? 'ใช่' : 'ไม่ใช่' }}</p>
            <p><strong>ต้องการเงิน:</strong> {{ selectedRequest.hasFunding ? 'ใช่' : 'ไม่ใช่' }}</p>
            <p><strong>เหตุผล:</strong> {{ selectedRequest.reasonText }}</p>
          </div>

          <div>
            <div class="uploaded-image" v-if="selectedRequest.imageUrl">
              <a @click.prevent="openModalimg">
                <img :src="selectedRequest.imageUrl" alt="รูปภาพที่แปลงกลับจาก Base64" width="200" />
              </a>
            </div>

            <div v-if="isModalOpen" class="modal">
              <div class="modal-content">
                <span class="close" @click="closeModalimg">&times;</span>
                <img :src="selectedRequest.imageUrl" alt="รูปภาพที่แปลงกลับจาก Base64" class="modal-image" />
              </div>
            </div>
          </div>

          <div class="approval">
            <label><input type="radio" name="approval" value="อนุมัติ" v-model="selectedRequest.status" />
              อนุมัติ</label>
            <label><input type="radio" name="approval" value="ไม่อนุมัติ" v-model="selectedRequest.status" />
              ไม่อนุมัติ</label>
          </div>

          <label for="remark">หมายเหตุ:</label>
          <textarea id="remark" rows="4" v-model="selectedRequest.reasonText"></textarea>
          <button v-if="loading === false" @click="updateLeave(selectedRequest)" class="submit-button">ยืนยัน</button>

          <div v-if="loading === true" class="spinner-border text-warning" role="status">
            <span class="sr-only">Loading...</span>
          </div>


          <div class="submit-button-b"> </div>
        </div>
      </div>


    </div>
  </div>

</template>

<script>
import Swal from 'sweetalert2'
export default {
  data() {
    return {
      requests: [],
      selectedRequest: null,
      loadingData: true,
      loading: false,
      isModalOpen: false,
    };
  },
  props: ['userData'],
  methods: {
    openModalimg() {
      this.isModalOpen = true;
    },
    closeModalimg() {
      this.isModalOpen = false;
    },
    openModal(request) {
      const axios = require('axios');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/users/getUserByLineId/' + request.lineId,
        headers: {}
      };

      axios.request(config)
        .then((response) => {
          this.selectedRequest = {
            ...response.data,
            ...request
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    updateLeave(datas) {
      this.loading = true
      this.selectedRequest = datas;
      const axios = require('axios');

      // ฟังก์ชันสำหรับการเพิ่มจำนวนวันลา
      const incrementLeave = async (lineId, apiField) => {
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

          await axios.request(updateConfig);
        } catch (error) {
          console.error(error);
        }
      };

      // อัปเดตจำนวนวันลาถ้าสถานะเป็นอนุมัติ
      if (this.selectedRequest.status === 'อนุมัติ') {
        switch (this.selectedRequest.type) {
          case 'ลาป่วย':
            incrementLeave(this.selectedRequest.lineId, 'totalSickLeave');
            break;
          case 'ลากิจ':
            incrementLeave(this.selectedRequest.lineId, 'totalPersonalLeave');
            break;
          case 'ลาพักร้อน':
            incrementLeave(this.selectedRequest.lineId, 'totalVacationLeave');
            break;
          case 'ลากิจพิเศษ':
          case 'อุปสมบท':
          case 'ลาคลอด':
          case 'ลาไม่รับค่าจ้าง':
            incrementLeave(this.selectedRequest.lineId, 'totalUnpaidLeave');
            break;
          case 'ลาออก':
            // ถ้าเป็นลาออก ไม่ต้องอัปเดตจำนวนวันลา
            break;
          default:
            console.log('ไม่พบประเภทการลา');
        }
      }

      // ตรวจสอบประเภทการลา ถ้าเป็น "ออกปฏิบัติงานนอกสถานที่" หรือ "ลาออก" จะใช้ API อื่น
      const apiUrl = this.selectedRequest.type === 'ออกปฏิบัติงานนอกสถานที่'
        ? `${process.env.API_URL}/LeaveOutside/updateLeaveOutside/${this.selectedRequest._id}`
        : this.selectedRequest.Type === 'ลาออก'
          ? `${process.env.API_URL}/LeaveResign/updateLeaveResign/${this.selectedRequest._id}` // API สำหรับลาออก
          : `${process.env.API_URL}/leave/updateLeave/${this.selectedRequest._id}`;

      // อัปเดตสถานะการลา
      let data = JSON.stringify({
        "status": this.selectedRequest.status,
        "reasonText": this.selectedRequest.reasonText || null
      });

      let config = {
        method: 'put',
        maxBodyLength: Infinity,
        url: apiUrl,
        headers: { 'Content-Type': 'application/json' },
        data: data
      };

      axios.request(config)
        .then((response) => {
          // alert('บันทึกสำเร็จ');
          Swal.fire({
            icon: 'success',
            title: 'บันทึกสำเร็จ',
            text: 'บันทึกสำเร็จ'
          })
          this.loading = false;
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
              .then(() => console.log())
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
      try {
        const axios = require('axios');

        const leaveRequestsUrl = `${process.env.API_URL}/leave/getLeavesByApprover/${approver}`;
        const leaveOutsideRequestsUrl = `${process.env.API_URL}/LeaveOutside/getLeavesOutside`;
        const leaveResignRequestsUrl = `${process.env.API_URL}/LeaveResign/getLeavesResign`; // URL สำหรับการลาออก

        // เรียก API ทั้งสามพร้อมกัน
        Promise.all([
          axios.get(leaveRequestsUrl),
          axios.get(leaveOutsideRequestsUrl),
          axios.get(leaveResignRequestsUrl) // เพิ่มการเรียก API สำหรับการลาออก
        ])
          .then(([leaveResponse, leaveOutsideResponse, leaveResignResponse]) => {
            // ตรวจสอบว่าข้อมูลมีอยู่และเป็น array
            const leaveRequests = Array.isArray(leaveResponse.data) ? leaveResponse.data : [];
            const leaveOutsideRequests = Array.isArray(leaveOutsideResponse.data) ? leaveOutsideResponse.data : [];
            const leaveResignRequests = Array.isArray(leaveResignResponse.data) ? leaveResignResponse.data : []; // ข้อมูลการลาออก

            // รวมข้อมูลทั้งสามประเภท
            this.requests = [...leaveRequests, ...leaveOutsideRequests, ...leaveResignRequests].sort((a, b) => {
              return new Date(b.sendDate) - new Date(a.sendDate); // เรียงจากมากไปน้อย (ล่าสุดไปเก่าสุด)
            });

            this.loadingData = false;
          })
          .catch((error) => {
            this.loadingData = false;
            console.log(error);
          });
      }
      catch (error) {
        console.error(error);
      }
    },

    closeModal() {
      this.selectedRequest = null;
    }
  },
  mounted() {
    this.loadingData = true;
    this.getLeavesByApprover(this.userData.name);
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
  /* padding: 20px; */
  padding-left: 20px;
  padding-right: 20px;
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