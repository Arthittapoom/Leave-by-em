export { default as Footermenu } from '../..\\components\\footermenu.vue'
export { default as Menubar } from '../..\\components\\Menubar.vue'
export { default as NavbarAdmin } from '../..\\components\\NavbarAdmin.vue'
export { default as NuxtLogo } from '../..\\components\\NuxtLogo.vue'
export { default as PieChart } from '../..\\components\\PieChart.vue'
export { default as Tutorial } from '../..\\components\\Tutorial.vue'
export { default as HomePage } from '../..\\components\\HomePages\\HomePage.vue'
export { default as HomePagesLeaveAbsence } from '../..\\components\\HomePages\\LeaveAbsence.vue'
export { default as HomePagesLeaveOutside } from '../..\\components\\HomePages\\LeaveOutside.vue'
export { default as HomePagesListRequests } from '../..\\components\\HomePages\\ListRequests.vue'
export { default as HomePagesResignFromWork } from '../..\\components\\HomePages\\ResignFromWork.vue'
export { default as MenuPagesAdminManagementPage } from '../..\\components\\MenuPages\\AdminManagementPage.vue'
export { default as MenuPagesDashboardPage } from '../..\\components\\MenuPages\\DashboardPage.vue'
export { default as MenuPagesLeaveDaySettingPage } from '../..\\components\\MenuPages\\LeaveDaySettingPage.vue'
export { default as MenuPagesLeaveManagementPage } from '../..\\components\\MenuPages\\LeaveManagementPage.vue'
export { default as MenuPagesLeaveResignManagementPage } from '../..\\components\\MenuPages\\LeaveResignManagementPage.vue'
export { default as MenuPagesUsersManagementPage } from '../..\\components\\MenuPages\\UsersManagementPage.vue'
export { default as MenuPagesLeaveDetails } from '../..\\components\\MenuPages\\Leave\\LeaveDetails.vue'
export { default as MenuPagesLeaveHistory } from '../..\\components\\MenuPages\\Leave\\LeaveHistory.vue'
export { default as MenuPagesLeaveResignDetails } from '../..\\components\\MenuPages\\Leave\\ResignDetails.vue'
export { default as MenuPagesAdminCreate } from '../..\\components\\MenuPages\\Admin\\create.vue'
export { default as MenuPagesAdminViewUserAdmin } from '../..\\components\\MenuPages\\Admin\\viewUserAdmin.vue'
export { default as MenuPagesUserDetails } from '../..\\components\\MenuPages\\User\\UserDetails.vue'

// nuxt/nuxt.js#8607
function wrapFunctional(options) {
  if (!options || !options.functional) {
    return options
  }

  const propKeys = Array.isArray(options.props) ? options.props : Object.keys(options.props || {})

  return {
    render(h) {
      const attrs = {}
      const props = {}

      for (const key in this.$attrs) {
        if (propKeys.includes(key)) {
          props[key] = this.$attrs[key]
        } else {
          attrs[key] = this.$attrs[key]
        }
      }

      return h(options, {
        on: this.$listeners,
        attrs,
        props,
        scopedSlots: this.$scopedSlots,
      }, this.$slots.default)
    }
  }
}
