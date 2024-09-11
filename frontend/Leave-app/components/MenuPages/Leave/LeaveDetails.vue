<template>
    <div class="profile-container scrollable-content">
      <div class="profile-pic">
        <div class="circle"></div>
        <p>รหัสพนักงาน {{ user.employeeId }}</p>
        <button class="view-history">ดูประวัติการลางาน</button>
      </div>
  
      <div class="form">
        <div class="form-row">
          <div class="input-group">
            <label>ชื่อผู้ใช้งาน</label>
            <input type="text" v-model="user.username" disabled />
          </div>
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
          <div class="input-group">
            <label>อีเมล</label>
            <input type="email" v-model="user.email" disabled />
          </div>
        </div>
  
        <div class="form-row">
          <div class="input-group">
            <label>เบอร์โทร</label>
            <input type="text" v-model="user.phone" disabled />
          </div>
          <div class="input-group">
            <label>แผนก</label>
            <input type="text" v-model="user.department" disabled />
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
  
        <div class="form-row">
          <label>เหตุผล *</label>
          <textarea v-model="user.reasonText" disabled></textarea>
        </div>
  
        <div class="form-row buttons">
          <button class="cancel-btn" @click="goBack">ยกเลิก</button>
          <button class="save-btn" @click="save">บันทึก</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: ['user'], // รับข้อมูลผู้ใช้ที่ถูกเลือกจาก parent
    methods: {
      goBack() {
        this.$emit('go-back'); // ส่งเหตุการณ์ย้อนกลับไปยัง parent component
      },
      save() {
        // Save logic here
        this.$emit('save', this.user);
      }
    }
  };
  </script>
  
  <style scoped>
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
    background-color: #a33331;
    border-radius: 50%;
    margin-bottom: 10px;
  }
  
  .view-history {
    background-color: #a33331;
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
    background-color: #5cbc97;
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
  