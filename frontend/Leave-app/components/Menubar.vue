<template>
    <div class="sidebar">
        <div @click="updatePage('AdminManagementPage')" class="sidebar-item">Admin</div>
        <div @click="updatePage('DashboardPage')" class="sidebar-item">Dashboard</div>
        <div @click="updatePage('LeaveManagementPage')" class="sidebar-item">Leave Management</div>
        <div @click="updatePage('UsersManagementPage')" class="sidebar-item">User Management</div>
        <div @click="updatePage('LeaveDaySettingPage')" class="sidebar-item">Leave Day Setting</div>
    </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  methods: {
    updatePage(page) {
      this.$store.dispatch('updatePage', page);
    }
  }
}
</script>

<style scoped>
 .sidebar {
    width: 200px;
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  .sidebar-item {
    padding: 10px;
    margin-bottom: 10px;
    background-color: #ccc;
    cursor: pointer;
  }
</style>