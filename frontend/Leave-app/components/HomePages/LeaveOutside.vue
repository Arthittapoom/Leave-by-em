<template>
    <div class="leave-outside-form">
      <label for="work-location">สถานที่ปฏิบัติงาน</label>
      <input type="text" id="work-location" v-model="workLocation" placeholder="ระบุสถานที่ปฏิบัติงาน" />
  
      <label for="vehicle">รถที่ใช้ออกปฏิบัติงาน</label>
      <input type="text" id="vehicle" v-model="vehicle" placeholder="ระบุรถที่ใช้ออกปฏิบัติงาน" />
  
      <label for="vehicle-number">เลขทะเบียนรถ</label>
      <input type="text" id="vehicle-number" v-model="vehicleNumber" placeholder="ระบุเลขทะเบียนรถ" />
  
      <label for="date">วัน / เดือน / ปี</label>
      <input type="date" id="date" v-model="date" />
  
      <label for="start-time">เวลาเริ่มออกปฏิบัติงาน</label>
      <input type="time" id="start-time" v-model="startTime" />
  
      <label for="end-time">เวลาเสร็จสิ้น</label>
      <input type="time" id="end-time" v-model="endTime" />
  
      <button type="button" @click="submitForm">ส่งคำขอการปฏิบัติงานนอกสถานที่</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        workLocation: '',
        vehicle: '',
        vehicleNumber: '',
        date: '',
        startTime: '',
        endTime: ''
      };
    },
    methods: {
      submitForm() {
        console.log('Form submitted with:', {
          workLocation: this.workLocation,
          vehicle: this.vehicle,
          vehicleNumber: this.vehicleNumber,
          date: this.date,
          startTime: this.startTime,
          endTime: this.endTime
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .leave-outside-form {
    display: flex;
    flex-direction: column;
    width: 300px;
  }
  
  .leave-outside-form label {
    margin-top: 10px;
    margin-bottom: 5px;
  }
  
  .leave-outside-form input[type="text"],
  .leave-outside-form input[type="date"],
  .leave-outside-form input[type="time"] {
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
    margin-top: 10px;
  }
  
  button:hover {
    background-color: #3700b3;
  }
  </style>
  