<template>
  <div>
    <div v-if="loadingData === true" class="spinner-border text-warning" role="status">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-if="loadingData === false" class="resign-form">
      <label for="resign-reason">เหตุผลในการลาออก :</label>
      <input type="text" id="resign-reason" v-model="resignReason" placeholder="ระบุเหตุผลการลาออก" />

      <label for="first-work-day">วันทำงานวันแรก</label>
      <input type="text" id="first-work-day" v-model="firstWorkDay" readonly />

      <label for="last-work-day">วันทำงานวันสุดท้าย</label>
      <input type="date" id="last-work-day" v-model="lastWorkDay" />

      <div class="checkbox-group">
        <label>
          <input type="checkbox" v-model="needsCertification" /> ต้องการหนังสือรับรอง
        </label>
        <label>
          <input type="checkbox" v-model="hasFunding" /> มีกองทุนหรือไม่
        </label>
      </div>

      <button v-if="loading === false" type="button" @click="submitForm">ส่งคำขอลาออก</button>
      <button v-if="loading === true" type="submit">
        <div class="spinner-border text-warning" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </button>
    </div>
  </div>

</template>

<script>
import Swal from 'sweetalert2'
const axios = require('axios');
export default {
  data() {
    return {
      resignReason: '',
      lastWorkDay: '',
      needsCertification: false,
      hasFunding: false,
      loading: false,
      loadingData: false,
      userData: null,
      firstWorkDay: '',
    };
  },
  methods: {
    async submitForm() {
      this.loading = true;
      try {
        // ตรวจสอบข้อมูลเบื้องต้น
        if (!this.resignReason) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณากรอกเหตุผลในการลาออก'
          }).then(() => {
            this.loading = false
          })
          return;
        }

        if (!this.lastWorkDay) {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'กรุณากรอกวันที่สิ้นสุดงาน'
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

        // เตรียมข้อมูลสำหรับส่งไปยัง API
        const data = JSON.stringify({
          firstWorkDay: this.firstWorkDay,
          lastWorkDay: this.lastWorkDay,
          needsCertification: this.needsCertification,
          hasFunding: this.hasFunding,
          status: 'รออนุมัติ',
          reasonText: this.resignReason,
          Type: 'ลาออก',
          sendDate: new Date(),
          initialLeaveApprover: this.userData.initialLeaveApprover,
          finalLeaveApprover: this.userData.finalLeaveApprover,
          lineId: localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')).userId : null,
          userId: this.userData._id
        });

        const config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${process.env.API_URL}/LeaveResign/createLeaveResign`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: data
        };

        // ส่งข้อมูลการลาออก
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
            title: 'สำหรับคำขอลาออกสำเร็จ',
            text: 'สำหรับคำขอลาออกสำเร็จแล้ว'
          }).then(() => {
            this.loading = false;
            this.$router.push('/');
          })
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
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
    },

    getUserByLineId(lineId) {
      const axios = require('axios');

      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/users/getUserByLineId/' + lineId,
        headers: {}
      };

      axios.request(config)
        .then((response) => {
          // console.log(response.data);
          this.userData = response.data;
          this.firstWorkDay = new Date(this.userData.startDate).toLocaleDateString('en-GB')
          this.loadingData = false
        })
        .catch((error) => {
          console.log(error);
        });

    }
  },
  mounted() {
    this.loadingData = true
    this.getUserByLineId(localStorage.getItem('profile') ? JSON.parse(localStorage.getItem('profile')).userId : null);
  }
};
</script>

<style scoped>
.resign-form {
  display: flex;
  flex-direction: column;
  width: 300px;
}

.resign-form label {
  margin-top: 10px;
  margin-bottom: 5px;
}

.resign-form input[type="text"],
.resign-form input[type="date"] {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
  width: 100%;
}

.checkbox-group {
  margin: 10px 0;
}

.checkbox-group label {
  display: block;
  margin-bottom: 5px;
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