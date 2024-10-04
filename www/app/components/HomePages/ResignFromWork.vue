<template>
  <div class="resign-form">
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

    <button type="button" @click="submitForm">ส่งคำขอลาออก</button>
  </div>
</template>

<script>
const axios = require('axios');
export default {
  data() {
    return {
      resignReason: '',
      firstWorkDay: this.userData.startDate ? new Date(this.userData.startDate).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/').reverse().join('-') : '',
      lastWorkDay: '',
      needsCertification: false,
      hasFunding: false
    };
  },
  props: ['userData'],
  methods: {
    async submitForm() {
      try {
        // ตรวจสอบข้อมูลเบื้องต้น
        if (!this.resignReason) {
          alert('กรุณากรอกเหตุผลในการลาออก');
          return;
        }

        if (!this.userData) {
          alert('กรุณาเข้าสู่ระบบก่อน');
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
          lineId: this.userData.lineId,
          userId: this.userData.id
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

        // console.log('Initial Leave Approver:', initialLeaveApprover);
        // console.log('Final Leave Approver:', finalLeaveApprover);

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
    }



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