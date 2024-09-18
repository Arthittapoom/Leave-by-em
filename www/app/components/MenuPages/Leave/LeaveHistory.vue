<template>
    <div class="user-details-container">
      <!-- User Information Section -->
      <div class="user-info">
        <div class="user-photo-section">
          <div class="user-photo">
            <!-- Placeholder for user photo -->
          </div>
          <p>รหัสพนักงาน {{ user.employeeId }}</p>
        </div>
  
        <div class="user-data-section">
          <div class="user-data">
            <label>ชื่อผู้ใช้งาน</label>
            <div class="data-box">{{ user.username }}</div>
          </div>
  
          <div class="user-data">
            <label>ชื่อ-นามสกุล</label>
            <div class="data-box">{{ user.fullName }}</div>
          </div>
  
          <div class="user-data">
            <label>เบอร์โทร</label>
            <div class="data-box">{{ user.phone }}</div>
          </div>
  
          <div class="user-data">
            <label>ตำแหน่ง</label>
            <div class="data-box">{{ user.position }}</div>
          </div>
  
          <div class="user-data">
            <label>อีเมล</label>
            <div class="data-box">{{ user.email }}</div>
          </div>
  
          <div class="user-data">
            <label>แผนก</label>
            <div class="data-box">{{ user.department }}</div>
          </div>
        </div>
      </div>
  
      <!-- Leave History Table Section -->
      <div class="leave-history-section">
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ประเภทการลา</th>
              <th>วันที่ลาวันแรก</th>
              <th>วันที่ลาวันสุดท้าย</th>
              <th>เหตุผลที่ลา</th>
              <th>สถานะคำขอ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(leave, index) in leaveHistory" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ leave.type }}</td>
              <td>{{ leave.startDate }}</td>
              <td>{{ leave.endDate }}</td>
              <td>{{ leave.reason }}</td>
              <td>
                <span :class="getStatusClass(leave.status)">
                  {{ leave.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Back Button -->
      <button @click="goBack" class="back-btn">ย้อนกลับ</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
          
          leaveHistory: [
              {
                  type: 'ลาป่วย',
                  startDate: 'xx/xx/xx',
                  endDate: 'xx/xx/xx',
                  reason: 'อื่นๆ',
                  status: 'อนุมัติ'  
              },
              {
                  type: 'ลากิจ',
                  startDate: 'xx/xx/xx',
                  endDate: 'xx/xx/xx',
                  reason: 'อื่นๆ',
                  status: 'ไม่อนุมัติ'  
              }
          ]    
      }
    },
    props: ['user'],
    methods: {
      goBack() {
        this.$emit('go-back-history');
      },
      getStatusClass(status) {
        if (status === 'รออนุมัติ') return 'pending';
        if (status === 'อนุมัติ') return 'approved';
        if (status === 'ไม่อนุมัติ') return 'rejected';
      }
    }
  };
  </script>
  
  <style scoped>
  /* User Details Container */
  .user-details-container {
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  
  /* User Info Section */
  .user-info {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  
  /* User Photo Section */
  .user-photo-section {
    text-align: center;
  }
  
  .user-photo {
    width: 120px;
    height: 120px;
    background-color: #8B0000;
    border-radius: 50%;
    margin-bottom: 10px;
  }
  
  .user-photo p {
    margin: 0;
    font-size: 16px;
  }
  
  /* User Data Section */
  .user-data-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 75%;
  }
  
  .user-data {
    width: 48%;
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .data-box {
    padding: 10px;
    background-color: #E0E0E0;
    border-radius: 5px;
    font-size: 16px;
    height: 40px;
  }
  
  /* Leave History Section */
  .leave-history-section {
    margin-top: 20px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  
  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    color: #8B0000;
  }
  
  .pending {
    background-color: #E0E0E0;
    color: #555;
    padding: 5px 10px;
    border-radius: 10px;
  }
  
  .approved {
    background-color: #C2F0E1;
    color: #17A789;
    padding: 5px 10px;
    border-radius: 10px;
  }
  
  .rejected {
    background-color: #F9D1D1;
    color: #D9534F;
    padding: 5px 10px;
    border-radius: 10px;
  }
  
  /* Back Button */
  .back-btn {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #8B0000;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  </style>
  