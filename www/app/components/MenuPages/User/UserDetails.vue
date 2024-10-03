<template>
  <div class="leave-profile-container scrollable-content">
    <div class="employee-info">
      <div class="employee-photo">
        <div class="circle"></div>
        <p>รหัสพนักงาน {{ form.code }}</p>
      </div>

      <div class="employee-details">
        <div class="form-row">
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
            <label>ชื่อเล่น</label>
            <input type="text" v-model="form.nickname" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>ประเภทพนักงาน</label>
            <input type="text" v-model="form.employeeType" />
          </div>
          <div class="input-group">
            <label>แผนก</label>
            <input type="text" v-model="form.department" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>ฝ่าย</label>
            <input type="text" v-model="form.division" />
          </div>
          <div class="input-group">
            <label>สถานที่ปฏิบัติงาน</label>
            <input type="text" v-model="form.workLocation" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>วันที่เริ่มทำงานวันแรก</label>
            <input type="text" :value="formattedStartDate(form.startDate)" @input="updateStartDate($event.target.value, 'startDate')" />
          </div>
          <div class="input-group">
            <label>วันที่ผ่านโปร</label>
            <input type="text" :value="formattedStartDate(form.passedDate)" @input="updateStartDate($event.target.value, 'passedDate')" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>Line ID</label>
            <input type="text" v-model="form.lineId" />
          </div>
          <div class="input-group">
            <label>เบอร์โทร</label>
            <input type="text" v-model="form.phone" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>อายุงาน (วัน)</label>
            <input type="text" v-model="form.diffDays_days" />
          </div>
          <div class="input-group">
            <label>อายุงาน (เดือน)</label>
            <input type="text" v-model="form.diffDays_months" />
          </div>
          <div class="input-group">
            <label>อายุงาน (ปี)</label>
            <input type="text" v-model="form.diffDays_years" />
          </div>
        </div>

        <div class="form-row">
          <div class="input-group">
            <label>จำนวนวันทำงาน จาก Excel</label>
            <input type="text" v-model="form.diffDays_days_exl" />
          </div>
          <div class="input-group">
            <label>ผู้อนุมัติการลาขั้นต้น</label>
            <input type="text" v-model="form.initialLeaveApprover" />
          </div>
          <div class="input-group">
            <label>ผู้อนุมัติสูงสุด</label>
            <input type="text" v-model="form.finalLeaveApprover" />
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
            <td>ลาป่วย (วัน)</td>
            <td><input type="number" v-model="form.sickLeave_days" /></td>
            <td>{{ form.remainingSickLeave }}</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลาป่วย (ชั่วโมง)</td>
            <td><input type="number" v-model="form.sickLeave_hours" /></td>
            <td>{{ form.remainingSickLeave }}</td>
            <td>ชม./ปี</td>
          </tr>
          <tr>
            <td>ลากิจ (วัน)</td>
            <td><input type="number" v-model="form.personalLeave_days" /></td>
            <td>{{ form.remainingPersonalLeave }}</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลากิจ (ชั่วโมง)</td>
            <td><input type="number" v-model="form.personalLeave_hours" /></td>
            <td>{{ form.remainingPersonalLeave }}</td>
            <td>ชม./ปี</td>
          </tr>
          <tr>
            <td>พักร้อน (วัน)</td>
            <td><input type="number" v-model="form.vacationLeave_days" /></td>
            <td>{{ form.remainingVacationLeave }}</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>พักร้อน (ชั่วโมง)</td>
            <td><input type="number" v-model="form.vacationLeave_hours" /></td>
            <td>{{ form.remainingVacationLeave }}</td>
            <td>ชม./ปี</td>
          </tr>
          <tr>
            <td>ลาไม่รับค่าจ้าง (วัน)</td>
            <td><input type="number" v-model="form.unpaidLeave_days" /></td>
            <td>{{ form.totalUnpaidLeave }}</td>
            <td>วัน/ปี</td>
          </tr>
          <tr>
            <td>ลาไม่รับค่าจ้าง (ชั่วโมง)</td>
            <td><input type="number" v-model="form.unpaidLeave_hours" /></td>
            <td>{{ form.totalUnpaidLeave }}</td>
            <td>ชม./ปี</td>
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
        id : this.user.id,
        code: this.user.username,
        department: this.user.department,
        fullName: this.user.fullName,
        nickname: this.user.nickname,
        position: this.user.position,
        employeeType: this.user.employeeType,
        division: this.user.division,
        workLocation: this.user.workLocation,
        startDate: this.user.startDate,
        passedDate: this.user.passedDate,
        diffDays_days: this.user.diffDays_days,
        diffDays_months: this.user.diffDays_months,
        diffDays_years: this.user.diffDays_years,
        initialLeaveApprover: this.user.initialLeaveApprover,
        finalLeaveApprover: this.user.finalLeaveApprover,
        diffDays_days_exl: this.user.diffDays_days_exl,
        sickLeave_days: this.user.sickLeave_days,
        sickLeave_hours: this.user.sickLeave_hours,
        totalSickLeave: this.user.totalSickLeave,
        remainingSickLeave: this.user.remainingSickLeave,
        personalLeave_days: this.user.personalLeave_days,
        personalLeave_hours: this.user.personalLeave_hours,
        totalPersonalLeave: this.user.totalPersonalLeave,
        remainingPersonalLeave: this.user.remainingPersonalLeave,
        vacationLeave_days: this.user.vacationLeave_days,
        vacationLeave_hours: this.user.vacationLeave_hours,
        totalVacationLeave: this.user.totalVacationLeave,
        remainingVacationLeave: this.user.grantedVacationLeave,
        grantedVacationLeave: this.user.grantedVacationLeave,
        unpaidLeave_days: this.user.unpaidLeave_days,
        unpaidLeave_hours: this.user.unpaidLeave_hours,
        totalUnpaidLeave: this.user.totalUnpaidLeave,
        specialPersonalLeave: this.user.specialPersonalLeave,
        ordinationLeave: this.user.ordinationLeave,
        maternityLeave: this.user.maternityLeave,
        workInjuryLeave_days: this.user.workInjuryLeave_days,
        lineId: this.user.lineId || 'null',
        phone: this.user.phone || 'null',
      }
    };
  },
  methods: {
    formattedStartDate(date) {
      if (date) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(date).toLocaleDateString('th-TH', options);
      }
      return '';
    },
    updateStartDate(value, field) {
      const [day, month, year] = value.split('/');
      this.form[field] = new Date(`${year}-${month}-${day}`).toISOString();
    },
    saveForm() {
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

th,
td {
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
