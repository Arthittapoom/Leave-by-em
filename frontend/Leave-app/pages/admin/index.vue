<template>
  <div class="dashboard-container">
    <Menubar  />
    <data class="main-section">
      <NavbarAdmin :page="page" />

      <div class="main-content">
        <AdminManagementPage v-if="page == 'AdminManagementPage'" />
        <DashboardPage v-if="page == 'DashboardPage'" />
        <LeaveManagementPage v-if="page == 'LeaveManagementPage'" />
        <UsersManagementPage v-if="page == 'UsersManagementPage'" />
        <LeaveDaySettingPage v-if="page == 'LeaveDaySettingPage'" />
  
        <createAdmin v-if="page == 'createAdmin'" />
  
      </div>
    </data>
  </div>
</template>

<script>
import AdminManagementPage from '../../components/MenuPages/AdminManagementPage.vue'
import DashboardPage from '../../components/MenuPages/DashboardPage.vue'
import LeaveManagementPage from '../../components/MenuPages/LeaveManagementPage.vue'
import LeaveDaySettingPage from '../../components/MenuPages/LeaveDaySettingPage.vue'
import UsersManagementPage from '../../components/MenuPages/UsersManagementPage.vue'
import Menubar from '../../components/Menubar.vue'

import createAdmin from '../../components/MenuPages/createAdmin/create.vue'

export default {
  components: {
    AdminManagementPage,
    DashboardPage,
    LeaveManagementPage,
    LeaveDaySettingPage,
    UsersManagementPage,
    Menubar,

    createAdmin
  },
  data() {
    return {

    }
  },
  computed: {
    page() {
      return this.$store.getters.page;
    }
  },
  mounted() {

  },
  methods: {

  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
}

.main-section {
  width: 100%;
}

</style>