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
  export default {
    data() {
      return {
        resignReason: '',
        firstWorkDay: '',
        lastWorkDay: '',
        needsCertification: false,
        hasFunding: false
      };
    },
    methods: {
      submitForm() {
        console.log('Form submitted with:', {
          firstWorkDay: this.firstWorkDay,
          lastWorkDay: this.lastWorkDay,
          needsCertification: this.needsCertification,
          hasFunding: this.hasFunding,
          status: 'รออนุมัติ',
          reasonText: this.resignReason
           
        });
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
  