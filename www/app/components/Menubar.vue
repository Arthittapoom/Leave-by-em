<template>
  <div class="sidebar">
    <div class="logo">
      <img src="/admin/logo.png" alt="WorkMotion Logo" />
    </div>
    <div class="menu-section">
      <p class="section-title">MY ADMIN</p>
      <div @click="updatePage('AdminManagementPage')" :class="{ 'active-item': activePage === 'AdminManagementPage' }"
        class="sidebar-item">
        <img class="icon-1" src="/admin/icon-1.png" alt=""> Admin
      </div>
    </div>
    <div class="menu-section">
      <p class="section-title">MANAGEMENT</p>
      <div @click="updatePage('DashboardPage')" :class="{ 'active-item': activePage === 'DashboardPage' }"
        class="sidebar-item">
        <img class="icon-1" src="/admin/icon-2.png" alt=""> Dashboard
      </div>
      <div @click="updatePage('LeaveManagementPage')" :class="{ 'active-item': activePage === 'LeaveManagementPage' }"
        class="sidebar-item">
        <img class="icon-1" src="/admin/icon-3.png" alt=""> Leave Management
      </div>
      <!-- LeaveResignManagementPage -->
      <div @click="updatePage('LeaveResignManagementPage')" :class="{ 'active-item': activePage === 'LeaveResignManagementPage' }"
        class="sidebar-item">
        <img class="icon-1" src="/admin/icon-3.png" alt=""> Resign Management
      </div>

      <div @click="updatePage('UsersManagementPage')" :class="{ 'active-item': activePage === 'UsersManagementPage' }"
        class="sidebar-item">
        <img class="icon-1" src="/admin/icon-4.png" alt=""> User Management
      </div>
      <div @click="updatePage('LeaveDaySettingPage')" :class="{ 'active-item': activePage === 'LeaveDaySettingPage' }"
        class="sidebar-item">
        <img class="icon-1" src="/admin/icon-5.png" alt=""> Leave Day Setting
      </div>
    </div>
    <div class="signout-section">
      <button class="signout-btn" @click="signOut"> <img class="icon-1" src="/admin/icon-6.png" alt="">
        ออกจากระบบ</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {

  data() {
    return {
      activePage: 'DashboardPage', // Default active page
    };
  },
  methods: {
    updatePage(page) {
      this.activePage = page;
      this.$store.dispatch('updatePage', page);
    },

    signOut() {

      const token = localStorage.getItem('token');


      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: process.env.API_URL+'/auth/logout',
        headers: {
          'Authorization': 'Bearer ' + token
        }
      };

      axios.request(config)
        .then((response) => {
          if(response.status == 200) {
            localStorage.removeItem('token');
            this.$router.push('/login-admin');
          }
        })
        .catch((error) => {
          console.log(error);
        });


      // this.$router.push('/login-admin');
    }
  }
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #ffffff;
  /* padding: 20px; */
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.logo {
  text-align: center;
  margin-bottom: 50px;
  margin-top: 20px;

  img {
    max-width: 35%;
  }
}

.menu-section {
  margin-bottom: 20px;
}

.section-title {
  font-weight: bold;
  color: #999;
  font-size: 12px;
  margin-bottom: 10px;
  margin-left: 20px;
}

.sidebar-item {
  padding: 10px;
  /* margin-bottom: 10px; */
  padding-left: 30px;
  background-color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  /* ADLaM Display */
  font-family: 'Kanit', sans-serif;
  font-style: normal;
  /* font-weight: bold; */



  transition: background-color 0.3s;
}


.sidebar-item i {
  margin-right: 10px;
}

.active-item {
  background-color: #e8cafa;
}

.sidebar-item:hover {
  background-color: #f4e3fe;
}

.signout-section {
  margin-top: auto;
  text-align: center;
  margin-bottom: 20px;
}

.signout-btn {
  background-color: #ffffff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  width: 100%;

  /* ADLaM Display */
  font-family: 'Kanit', sans-serif;
  font-style: normal;
  /* font-weight: bold; */

}

.signout-btn:hover {
  background-color: #f4e3fe;
}

.icon-1 {
  margin-right: 10px;
  width: 20px;
  height: 20px;
}
</style>
