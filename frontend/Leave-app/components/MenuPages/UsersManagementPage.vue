<template>
    <div>
      <LeaveDetails v-if="selectedUser" :user="selectedUser" @go-back="goBack" @save="saveUser" />
  
      <table v-if="!selectedUser">
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
          <tr v-for="(user, index) in users" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ user.employeeId }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.position }}</td>
            <td>{{ user.workLocation }}</td>
            <td class="action-buttons">
              <button @click="viewUser(user)" class="view-btn">
                <img class="icon" src="../../static/admin/admin/icon-1.png" alt="view">
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import LeaveDetails from '../../components/MenuPages/User/UserDetails.vue';
  
  export default {
    components: {
      LeaveDetails
    },
    data() {
      return {
        users: [
          { employeeId: '1001', username: 'Clara1', fullName: 'Clara Doe', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
          { employeeId: '1002', username: 'Clara2', fullName: 'Jane Doe', position: 'UX/UI Designer', workLocation: 'สำนักงานใหญ่' },
          // ข้อมูลผู้ใช้อื่นๆ
        ],
        selectedUser: null
      };
    },
    methods: {
      viewUser(user) {
        this.selectedUser = user; // เลือกผู้ใช้ที่ต้องการดูรายละเอียด
      },
      goBack() {
        this.selectedUser = null; // ย้อนกลับไปยังรายการผู้ใช้
      },
      saveUser(updatedUser) {
        console.log('Updated user:', updatedUser);
        // const index = this.users.findIndex(user => user.employeeId === updatedUser.employeeId);
        // if (index !== -1) {
        //   this.users.splice(index, 1, updatedUser); // อัพเดตข้อมูลผู้ใช้
        // }
        this.selectedUser = null; // กลับไปที่รายการหลังจากบันทึก
      }
    }
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
    background-color: #ffffff;
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
  