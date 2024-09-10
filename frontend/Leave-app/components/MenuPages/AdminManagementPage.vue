<template>
    <div>
        
      <!-- <h1>Admin Management</h1> -->
      <table>
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>ชื่อผู้ใช้</th>
            <th>อีเมล</th>
            <th>หน้าที่</th>
            <th>วันที่สร้าง</th>
            <th>เปิด-ปิดการใช้งาน</th>
            <th>ปรับแต่ง</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in users" :key="user.email + index" :class="{ activeRow: index === 0 }">
            <td>{{ index + 1 }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.createdAt }}</td>
            <td>
              <label class="switch">
                <input type="checkbox" v-model="user.isActive" @change="toggleUserStatus(user)" />
                <span class="slider"></span>
              </label>
              {{ user.isActive ? 'เปิด' : 'ปิด' }}
            </td>
            <td class="action-buttons">
              <button class="view-btn"><img class="icon" src="../../static/admin/admin/icon-1.png" alt=""></button>
              <button class="edit-btn"><img class="icon" src="../../static/admin/admin/icon-2.png" alt=""></button>
              <button class="delete-btn"><img class="icon" src="../../static/admin/admin/icon-3.png" alt=""></button>
            </td>
          </tr>
        </tbody>
      </table>
      <button @click="createUser('createAdmin')" class="create-btn">สร้างผู้ใช้และหน้าที่</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        users: [
          {
            name: 'Gracezel',
            email: 'gracezelewalin@gmail.com',
            role: 'HR',
            createdAt: 'xx/xx/xx',
            isActive: true
          },
          {
            name: 'Gracezel',
            email: 'gracezelewalin@gmail.com',
            role: 'Manager',
            createdAt: 'xx/xx/xx',
            isActive: true
          },
          {
            name: 'Gracezel',
            email: 'gracezelewalin@gmail.com',
            role: 'Manager',
            createdAt: 'xx/xx/xx',
            isActive: true
          },
          {
            name: 'Gracezel',
            email: 'gracezelewalin@gmail.com',
            role: 'Manager',
            createdAt: 'xx/xx/xx',
            isActive: false
          },
          {
            name: 'Gracezel',
            email: 'gracezelewalin@gmail.com',
            role: 'Manager',
            createdAt: 'xx/xx/xx',
            isActive: false
          }
        ]
      };
    },
    methods: {
      createUser(page) {
        this.$store.dispatch('updatePage', page);   
      },
      toggleUserStatus(user) {
        alert(user.isActive ? 'เปิดการใช้งาน' : 'ปิดการใช้งาน');
        user.isActive = !user.isActive;
      }
    }
  };
  </script>
  
  <style scoped>
  .icon{
    width: 18px;
  }
  /* Table styling */
  table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'Arial', sans-serif;
    /* ลบเส้นกรอบ */
    border-spacing: 0;
  }
  
  th, td {
    /* ลบเส้นกรอบ */
    border-spacing: 0;
    padding: 10px;
    text-align: left;
  }
  
  tr:hover {
    background-color: #f4e7fa;
  }
  
  th {
    color: #5016a7;
  }
  
  .action-buttons {
    display: flex;
    gap: 5px;
  }
  
  button {
    border: none;
    padding: 8px;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .view-btn {
    background-color: #5CBCAB;
    color: white;
  }
  
  .edit-btn {
    background-color: #EFD288;
    color: black;
  }
  
  .delete-btn {
    background-color: #DF6565;
    color: white;
  }
  
  /* Switch styling */
  .switch {
    position: relative;
    display: inline-block;
    width: 34px;
    height: 20px;
  }
  
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 14px;
    width: 14px;
    border-radius: 50%;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
  }
  
  input:checked + .slider {
    background-color: #4CAF50;
  }
  
  input:checked + .slider:before {
    transform: translateX(14px);
  }
  
  /* Create user button */
  .create-btn {
    margin-top: 20px;
    background-color: #c492d5;
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .create-btn:hover {
    background-color: #dacedd;
  }
  </style>
  