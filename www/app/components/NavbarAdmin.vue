<template>
    <div>
      <nav class="navbar">
        <!-- Left Logo -->
        <div class="navbar-left">
          <span class="logo">ADMIN</span>
        </div>
  
        <!-- Center Link -->
        <div class="navbar-center">
          <!-- แปลงค่า page เป็นภาษาไทย -->
          <span class="nav-title">|  {{ translatedPage }}</span>
        </div>
  
        <!-- Right Profile Icon -->
        <div class="navbar-right">
          <nuxt-link to="/profile">
            <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" alt="Profile Icon" class="profile-icon" />
          </nuxt-link>
        </div>
      </nav>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      page: {
        type: String,
        required: true
      }
    },
    computed: {
      translatedPage() {
        const translations = {
          'AdminManagementPage': 'การจัดการผู้ดูแลระบบ',
          'DashboardPage': 'แดชบอร์ด',
          'LeaveManagementPage': 'การจัดการการลางาน',
          'UsersManagementPage': 'การจัดการผู้ใช้งาน',
          'LeaveDaySettingPage': 'การตั้งค่าวันลา'
          // เพิ่มคำแปลอื่นๆ ได้ตามต้องการ
        };
        // คืนค่าคำแปล หรือคืนค่าเดิมถ้าไม่มีคำแปล
        return translations[this.page] || this.page;
      }
    }
  };
  </script>
  
  <style scoped>
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: white;
    /* border-bottom: 1px solid #ccc; */
    height: 70px;
    /* box-shadow bottom */
    box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.1);
    padding: 0 20px;

    z-index: -1;
  }
  
  .navbar-left {
    font-weight: bold;
    font-size: 20px;
  }
  
  .navbar-center {
    margin-left: 10px;
    text-align: start;
    flex-grow: 1;
  }
  
  .nav-title {
    font-size: 18px;
    font-weight: normal;
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
  }
  
  .profile-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }
  </style>
  