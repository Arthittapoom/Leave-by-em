<template>
  <div>
    <LeaveHistory :user="user" @go-back-history="goBackHistory" v-if="history === true" />

    <div v-if="history === false" class="profile-container scrollable-content">
      <div class="profile-pic">
        <div class="circle"></div>
        <p>รหัสพนักงาน {{ user.employeeId }}</p>
        <button @click="viewHistory(user)" class="view-history">ดูประวัติการลางาน</button>
      </div>

      <div class="form">
        <div class="form-row">
          <div class="input-group">
            <label>ตำแหน่ง</label>
            <input type="text" v-model="user.position" disabled />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>ชื่อ - นามสกุล</label>
            <input type="text" v-model="user.fullName" disabled />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>เบอร์โทร</label>
            <input type="text" v-model="user.dataUser.phone" disabled />
          </div>
          <div class="input-group">
            <label>แผนก</label>
            <input type="text" v-model="user.dataUser.department" disabled />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>ประเภทการลา</label>
            <input type="text" v-model="user.leaveType" disabled />
          </div>
          <div class="input-group">
            <label>เหตุผลการลา</label>
            <input type="text" v-model="user.leaveReason" disabled />
          </div>
        </div>

        <!-- ส่วนรายละเอียดสำหรับคำขอลานอกสถานที่ -->
        <div v-if="user.leaveType === 'ออกปฏิบัติงานนอกสถานที่'" class="form-row">
          <div class="input-group">
            <label>สถานที่</label>
            <input type="text" v-model="user.workLocation" disabled />
          </div>
          <div class="input-group">
            <label>ยานพาหนะ</label>
            <input type="text" v-model="user.vehicle" disabled />
          </div>
        </div>

        <div v-if="user.leaveType === 'ออกปฏิบัติงานนอกสถานที่'" class="form-row">
          <div class="input-group">
            <label>หมายเลข</label>
            <input type="text" v-model="user.vehicleNumber" disabled />
          </div>
          <div class="input-group">
            <label>วันที่เริ่มลา</label>
            <input type="date" v-model="user.startDate" disabled />
          </div>
        </div>

        <div v-if="user.leaveType === 'ออกปฏิบัติงานนอกสถานที่'" class="form-row">
          <div class="input-group">
            <label>วันที่สิ้นสุดลา</label>
            <input type="date" v-model="user.endDate" disabled />
          </div>
          <div class="input-group">
            <label>เวลาเริ่มลา</label>
            <input type="time" v-model="user.startTime" disabled />
          </div>
        </div>

        <div v-if="user.leaveType === 'ออกปฏิบัติงานนอกสถานที่'" class="form-row">
          <div class="input-group">
            <label>เวลาสิ้นสุดลา</label>
            <input type="time" v-model="user.endTime" disabled />
          </div>
        </div>


        <div class="form-row">
          <label>สถานะคำขอ</label>
          <div class="radio-group">
            <label class="radio-option">
              <input type="radio" value="อนุมัติ" v-model="user.status" /> อนุมัติ
            </label>
            <label class="radio-option">
              <input type="radio" value="ไม่อนุมัติ" v-model="user.status" /> ไม่อนุมัติ
            </label>

            


          </div>

         

        </div>

        <!-- <pre>user: {{ user.dataLeave.imageUrl }}</pre> -->

        <!-- รูปภาพแนบ -->
        <div class="uploaded-image" v-if="user.dataLeave.imageUrl">
        <a @click.prevent="openModalimg">
          <img :src="user.dataLeave.imageUrl" alt="รูปภาพที่แปลงกลับจาก Base64" width="200" />
        </a>
        </div>

        <!-- Modal สำหรับแสดงรูปภาพ -->
        <div v-if="isModalOpen" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModalimg">&times;</span>
          <img :src="user.dataLeave.imageUrl" alt="รูปภาพที่แปลงกลับจาก Base64" class="modal-image" />
        </div>
        </div>

        <div class="form-row">
          <label>เหตุผล *</label>
          <textarea v-model="user.reasonText"></textarea>
        </div>

        <div class="form-row buttons">
          <button class="cancel-btn" @click="goBack">ยกเลิก</button>
          <button class="save-btn" @click="save">บันทึก</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LeaveHistory from '../Leave/LeaveHistory.vue';
export default {
  components: {
    LeaveHistory
  },
  data() {
    return {
      history: false,
      leaveItems: [],
      isModalOpen: false
    };
  },
  props: ['user'], // รับข้อมูลผู้ใช้ที่ถูกเลือกจาก parent
  mounted() {
    console.log(this.user);

  },
  methods: {
    openModalimg() {
      this.isModalOpen = true;
    },
    closeModalimg() {
      this.isModalOpen = false;
    },
    viewHistory() {
      this.history = true;
    },
    goBack() {
      this.$emit('go-back'); // ส่งเหตุการณ์ย้อนกลับไปยัง parent component
    },
    goBackHistory() {
      this.history = false;
    },
    save() {
      // Save logic here
      this.$emit('save', this.user);
    }
  }
};
</script>

<style scoped>
/* Modal overlay */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* สีพื้นหลังโปร่งใส */
  z-index: 1000; /* เลเยอร์สูงสุด */
}

/* Content ของ Modal */
.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  max-width: 600px; /* กำหนดความกว้างของ modal */
  width: 100%;
  position: relative;
}

.profile-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.profile-pic {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 50px;
}

.circle {
  width: 120px;
  height: 120px;
  background-color: #8a6d9f;
  border-radius: 50%;
  margin-bottom: 10px;
}

.view-history {
  background-color: #8a6d9f;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.form {
  width: 60%;
}

.form-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.input-group {
  flex: 1;
  margin-right: 15px;
}

.input-group:last-child {
  margin-right: 0;
}

label {
  display: block;
  margin-bottom: 5px;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #f5f5f5;
  color: #333;
}

textarea {
  height: 100px;
  resize: none;
}

.radio-group {
  display: flex;
  justify-content: space-between;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
}

.radio-option {
  flex: 1;
  display: flex;
  align-items: center;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  background-color: #ccc;
  color: black;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
  margin-right: 10px;
}

.save-btn {
  background-color: #8a6d9f;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
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
</style>