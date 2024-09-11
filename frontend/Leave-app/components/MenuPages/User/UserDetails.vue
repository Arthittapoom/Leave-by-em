<template>
  <div class="leave-profile-container scrollable-content">
    <div class="employee-info">
      <div class="employee-photo">
        <div class="circle"></div>
        <p>รหัสพนักงาน 67890</p>
      </div>

      <div class="employee-details">
        <div class="form-row">
          <div class="input-group">
            <label>ชื่อผู้ใช้งาน</label>
            <input type="text" v-model="form.username" />
          </div>
          <div class="input-group">
            <label>ตำแหน่ง</label>
            <input type="text" v-model="form.position" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>ชื่อ - นามสกุล</label>
            <input type="text" v-model="form.fullName" />
          </div>
          <div class="input-group">
            <label>อีเมล</label>
            <input type="email" v-model="form.email" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>เบอร์โทร</label>
            <input type="text" v-model="form.phone" />
          </div>
          <div class="input-group">
            <label>แผนก</label>
            <input type="text" v-model="form.department" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>สถานะพนักงาน</label>
            <input type="text" v-model="form.employeeStatus" />
          </div>
          <div class="input-group">
            <label>สถานที่ปฏิบัติงาน</label>
            <input type="text" v-model="form.workLocation" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>วันที่เริ่มทำงานวันแรก</label>
            <input type="date" v-model="form.firstDay" />
          </div>
        </div>
      </div>
    </div>

    <div class="leave-info">
      <h3>วันลา</h3>
      <table>
        <thead>
          <tr>
            <th>ประเภทการลา</th>
            <th>ลาไป</th>
            <th>คงเหลือ</th>
            <th>วัน/ปี</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ลาป่วย</td>
            <td><input type="number" v-model="form.sickLeaveUsed" /></td>
            <td>28</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลากิจ</td>
            <td><input type="number" v-model="form.personalLeaveUsed" /></td>
            <td>8</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลาพิเศษ</td>
            <td><input type="number" v-model="form.specialLeaveUsed" /></td>
            <td>3</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลากะลอด</td>
            <td><input type="number" v-model="form.marriageLeaveUsed" /></td>
            <td>98</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลาเพื่อรับราชการทหาร</td>
            <td><input type="number" v-model="form.militaryLeaveUsed" /></td>
            <td>60</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลาเพื่ออุปสมบท</td>
            <td><input type="number" v-model="form.ordinationLeaveUsed" /></td>
            <td>30</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลาหยุดพักผ่อนประจำปี</td>
            <td><input type="number" v-model="form.annualLeaveUsed" /></td>
            <td>6</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลาไม่รับค่าจ้าง</td>
            <td><input type="number" v-model="form.unpaidLeaveUsed" step="0.5" /></td>
            <td>4.5</td>
            <td>วัน/ปี</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="form-actions">
      <button @click="goBack">ย้อนกลับ</button>
      <button @click="saveForm">บันทึก</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['user'],
  data() {
    return {
      form: {
        username: this.user.username,
        position: this.user.position,
        fullName: this.user.fullName,
        email: this.user.email,
        phone: this.user.phone,
        department: this.user.department,
        employeeStatus: this.user.employeeStatus,
        workLocation: this.user.workLocation,
        firstDay: this.user.firstDay,
        sickLeaveUsed: 2,
        personalLeaveUsed: 0,
        specialLeaveUsed: 0,
        marriageLeaveUsed: 0,
        militaryLeaveUsed: 0,
        ordinationLeaveUsed: 0,
        annualLeaveUsed: 0,
        unpaidLeaveUsed: 0.5,
      }
    };
  },
  methods: {
    saveForm() {
      // Save the form data
      this.$emit('save', this.form);
    },
    goBack() {
      this.$emit('go-back');
    }
  }
};
</script>

<style scoped>
.leave-profile-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* padding: 20px; */
}

.employee-info {
  display: flex;
  width: 70%;
  margin-bottom: 20px;
  
}

.employee-photo {
  width: 150px;
  text-align: center;
  padding: 10px;
}

.circle {
  width: 120px;
  height: 120px;
  background-color: #a33331;
  border-radius: 50%;
}

.employee-details {
  flex: 1;
  margin-left: 20px;
}

.form-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.input-group {
  flex: 1;
  margin-right: 15px;

  input {
    padding: 10px;
    border-radius: 5px;
    width: 100%;
  }
}

.input-group:last-child {
  margin-right: 0;
}

.leave-info {
  width: 70%;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
}

input {
  padding: 8px;
  border-radius: 5px;
  width: 25%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  width: 70%;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

button:first-child {
  background-color: #ccc;
}

button:last-child {
  background-color: #5cbc97;
  color: white;
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
