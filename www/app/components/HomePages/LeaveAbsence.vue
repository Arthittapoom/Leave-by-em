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
    };
  },
  // ดึง userData มาจากหน้า HomePages
  props: ['userData'],
  methods: {
    submitLeaveRequest() {

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
        "status": "รออนุมัติ",
        "reasonText": " ",
        "initialLeaveApprover": this.userData.initialLeaveApprover,
        "finalLeaveApprover": this.userData.finalLeaveApprover
      });
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.API_URL + '/leave/createLeave',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios.request(config)
        .then((response) => {
          // เมื่อบันทึกสำเร็จแล้ว แสดง alert ก่อน

          // หลังจาก alert ให้ส่งข้อมูลผ่าน axios ไปยัง API อื่น
          let sendImageConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.API_URL + '/lineApi/sendImage/' + response.data.lineId,
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({
              "message": "รออนุมัติ"
            })
          };

          axios.request(sendImageConfig)
            .then((response) => {

              const axios = require('axios');

              let initialApprover = this.userData.initialLeaveApprover;
              let finalApprover = this.userData.finalLeaveApprover;

              // ตรวจสอบและส่ง request ให้กับ initialLeaveApprover ถ้ามีค่า
              if (initialApprover) {
                let configInitial = {
                  method: 'get',
                  maxBodyLength: Infinity,
                  url: `${process.env.API_URL}/users/getUserByName/${initialApprover}`,
                  headers: {}
                };

                axios.request(configInitial)
                  .then((response) => {
                    // console.log('Initial Approver:', response.data[0].lineId);
                    if (response.data[0].lineId) {
                      const axios = require('axios');
                      let data = JSON.stringify({
                        "message": "มีคำขอใหม่"
                      });

                      let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: process.env.API_URL + '/lineApi/sendImage/' + response.data[0].lineId,
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        data: data
                      };

                      axios.request(config)
                        .then((response) => {
                          // console.log(JSON.stringify(response.data));
                        })
                        .catch((error) => {
                          console.log(error);
                        });

                    }
                    return
                  })
                  .catch((error) => {
                    console.log('Error Initial Approver:', error);
                  });
              }

              // ตรวจสอบและส่ง request ให้กับ finalLeaveApprover ถ้ามีค่า
              if (finalApprover) {
                let configFinal = {
                  method: 'get',
                  maxBodyLength: Infinity,
                  url: `${process.env.API_URL}/users/getUserByName/${finalApprover}`,
                  headers: {}
                };

                axios.request(configFinal)
                  .then((response) => {
                    // console.log('Final Approver:', response.data[0].lineId);
                    if (response.data[0].lineId) {
                      const axios = require('axios');
                      let data = JSON.stringify({
                        "message": "มีคำขอใหม่"
                      });

                      let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: process.env.API_URL + '/lineApi/sendImage/' + response.data[0].lineId,
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        data: data
                      };

                      axios.request(config)
                        .then((response) => {
                          // console.log(JSON.stringify(response.data));
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    }
                    return
                  })
                  .catch((error) => {
                    console.log('Error Final Approver:', error);
                  });
              }

              // หากทั้งสองค่าไม่ถูกส่ง
              if (!initialApprover && !finalApprover) {
                console.log("No approvers available.");
                alert('ไม่พบข้อมูลผู้อนุมัติ');
              } else {
                alert('บันทึกสำเร็จ');
                this.$router.push('/');
              }


            })
            .catch((error) => {
              console.log(error);
            });

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