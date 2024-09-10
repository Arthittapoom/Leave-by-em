<template>
    <div>
      <!-- <h1>Users Management</h1> -->
  
      <!-- Users Table -->
      <table>
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>รหัสพนักงาน</th>
            <th>ชื่อผู้ใช้</th>
            <th>ชื่อ-นามสกุล</th>
            <th>ตำแหน่ง</th>
            <th>สถานที่ปฏิบัติงาน</th>
            <th>ปรับแต่ง</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="index"> <!-- Fixed key -->
            <td>{{ index + 1 }}</td>
            <td>{{ user.employeeId }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.position }}</td>
            <td>{{ user.workLocation }}</td>
            <td class="action-buttons">
              <button class="view-btn">
                <img class="icon" src="../../static/admin/admin/icon-1.png" alt="view">
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        users: [
          { employeeId: 'xxxxxxx', username: 'Clara', fullName: 'xxxxxxx', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
          { employeeId: 'xxxxxxx', username: 'Clara', fullName: 'xxxxxxx', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
          { employeeId: 'xxxxxxx', username: 'Clara', fullName: 'xxxxxxx', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
          { employeeId: 'xxxxxxx', username: 'Clara', fullName: 'xxxxxxx', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
        ]
      };
    },
  };
  </script>
  
  <style scoped>
  .icon {
    width: 18px;
  }
  
  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Arial', sans-serif;
    border-spacing: 0;
  }
  
  th, td {
    padding: 10px;
    text-align: left;
  }
  
  th {
    background-color: #f9f9f9;
    color: #5016a7;
  }
  
  tbody tr:hover {
    background-color: #f4e7fa;
  }
  
  .action-buttons {
    display: flex;
    gap: 5px;
  }
  
  button {
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .view-btn {
    background-color: #5CBCAB;
    color: white;
  }
  
  .view-btn img {
    width: 16px;
    height: 16px;
  }
  </style>
  