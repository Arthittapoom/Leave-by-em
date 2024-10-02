export const Footermenu = () => import('../..\\components\\footermenu.vue' /* webpackChunkName: "components/footermenu" */).then(c => wrapFunctional(c.default || c))
export const Menubar = () => import('../..\\components\\Menubar.vue' /* webpackChunkName: "components/menubar" */).then(c => wrapFunctional(c.default || c))
export const NavbarAdmin = () => import('../..\\components\\NavbarAdmin.vue' /* webpackChunkName: "components/navbar-admin" */).then(c => wrapFunctional(c.default || c))
export const NuxtLogo = () => import('../..\\components\\NuxtLogo.vue' /* webpackChunkName: "components/nuxt-logo" */).then(c => wrapFunctional(c.default || c))
export const PieChart = () => import('../..\\components\\PieChart.vue' /* webpackChunkName: "components/pie-chart" */).then(c => wrapFunctional(c.default || c))
export const Tutorial = () => import('../..\\components\\Tutorial.vue' /* webpackChunkName: "components/tutorial" */).then(c => wrapFunctional(c.default || c))
export const HomePage = () => import('../..\\components\\HomePages\\HomePage.vue' /* webpackChunkName: "components/home-page" */).then(c => wrapFunctional(c.default || c))
export const HomePagesLeaveAbsence = () => import('../..\\components\\HomePages\\LeaveAbsence.vue' /* webpackChunkName: "components/home-pages-leave-absence" */).then(c => wrapFunctional(c.default || c))
export const HomePagesLeaveOutside = () => import('../..\\components\\HomePages\\LeaveOutside.vue' /* webpackChunkName: "components/home-pages-leave-outside" */).then(c => wrapFunctional(c.default || c))
export const HomePagesListRequests = () => import('../..\\components\\HomePages\\ListRequests.vue' /* webpackChunkName: "components/home-pages-list-requests" */).then(c => wrapFunctional(c.default || c))
export const HomePagesResignFromWork = () => import('../..\\components\\HomePages\\ResignFromWork.vue' /* webpackChunkName: "components/home-pages-resign-from-work" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesAdminManagementPage = () => import('../..\\components\\MenuPages\\AdminManagementPage.vue' /* webpackChunkName: "components/menu-pages-admin-management-page" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesDashboardPage = () => import('../..\\components\\MenuPages\\DashboardPage.vue' /* webpackChunkName: "components/menu-pages-dashboard-page" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesLeaveDaySettingPage = () => import('../..\\components\\MenuPages\\LeaveDaySettingPage.vue' /* webpackChunkName: "components/menu-pages-leave-day-setting-page" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesLeaveManagementPage = () => import('../..\\components\\MenuPages\\LeaveManagementPage.vue' /* webpackChunkName: "components/menu-pages-leave-management-page" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesUsersManagementPage = () => import('../..\\components\\MenuPages\\UsersManagementPage.vue' /* webpackChunkName: "components/menu-pages-users-management-page" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesAdminCreate = () => import('../..\\components\\MenuPages\\Admin\\create.vue' /* webpackChunkName: "components/menu-pages-admin-create" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesAdminViewUserAdmin = () => import('../..\\components\\MenuPages\\Admin\\viewUserAdmin.vue' /* webpackChunkName: "components/menu-pages-admin-view-user-admin" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesLeaveDetails = () => import('../..\\components\\MenuPages\\Leave\\LeaveDetails.vue' /* webpackChunkName: "components/menu-pages-leave-details" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesLeaveHistory = () => import('../..\\components\\MenuPages\\Leave\\LeaveHistory.vue' /* webpackChunkName: "components/menu-pages-leave-history" */).then(c => wrapFunctional(c.default || c))
export const MenuPagesUserDetails = () => import('../..\\components\\MenuPages\\User\\UserDetails.vue' /* webpackChunkName: "components/menu-pages-user-details" */).then(c => wrapFunctional(c.default || c))

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
