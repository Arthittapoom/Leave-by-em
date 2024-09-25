import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _5de2e2df = () => interopDefault(import('..\\pages\\admin\\index.vue' /* webpackChunkName: "pages/admin/index" */))
const _55eea460 = () => interopDefault(import('..\\pages\\leaveabsence\\index.vue' /* webpackChunkName: "pages/leaveabsence/index" */))
const _63443ff8 = () => interopDefault(import('..\\pages\\leaveoutside\\index.vue' /* webpackChunkName: "pages/leaveoutside/index" */))
const _3048cc24 = () => interopDefault(import('..\\pages\\listrequests\\index.vue' /* webpackChunkName: "pages/listrequests/index" */))
const _bf3b7af6 = () => interopDefault(import('..\\pages\\login\\index.vue' /* webpackChunkName: "pages/login/index" */))
const _766fe47a = () => interopDefault(import('..\\pages\\login-admin\\index.vue' /* webpackChunkName: "pages/login-admin/index" */))
const _38e8b176 = () => interopDefault(import('..\\pages\\profile\\index.vue' /* webpackChunkName: "pages/profile/index" */))
const _7a0aabbb = () => interopDefault(import('..\\pages\\resignfromwork\\index.vue' /* webpackChunkName: "pages/resignfromwork/index" */))
const _eb4e4774 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))
const _9d1184a2 = () => interopDefault(import('..\\pages\\home\\_id.vue' /* webpackChunkName: "pages/home/_id" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/admin",
    component: _5de2e2df,
    name: "admin"
  }, {
    path: "/leaveabsence",
    component: _55eea460,
    name: "leaveabsence"
  }, {
    path: "/leaveoutside",
    component: _63443ff8,
    name: "leaveoutside"
  }, {
    path: "/listrequests",
    component: _3048cc24,
    name: "listrequests"
  }, {
    path: "/login",
    component: _bf3b7af6,
    name: "login"
  }, {
    path: "/login-admin",
    component: _766fe47a,
    name: "login-admin"
  }, {
    path: "/profile",
    component: _38e8b176,
    name: "profile"
  }, {
    path: "/resignfromwork",
    component: _7a0aabbb,
    name: "resignfromwork"
  }, {
    path: "/",
    component: _eb4e4774,
    name: "index"
  }, {
    path: "/home/:id?",
    component: _9d1184a2,
    name: "home-id"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
