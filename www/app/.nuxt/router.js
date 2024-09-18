import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _03c6bf5d = () => interopDefault(import('..\\pages\\admin\\index.vue' /* webpackChunkName: "pages/admin/index" */))
const _7e0f5e22 = () => interopDefault(import('..\\pages\\leaveabsence\\index.vue' /* webpackChunkName: "pages/leaveabsence/index" */))
const _e9360c8c = () => interopDefault(import('..\\pages\\leaveoutside\\index.vue' /* webpackChunkName: "pages/leaveoutside/index" */))
const _586985e6 = () => interopDefault(import('..\\pages\\listrequests\\index.vue' /* webpackChunkName: "pages/listrequests/index" */))
const _46461f03 = () => interopDefault(import('..\\pages\\login\\index.vue' /* webpackChunkName: "pages/login/index" */))
const _18a813c1 = () => interopDefault(import('..\\pages\\login-admin\\index.vue' /* webpackChunkName: "pages/login-admin/index" */))
const _c02b477a = () => interopDefault(import('..\\pages\\profile\\index.vue' /* webpackChunkName: "pages/profile/index" */))
const _1ce3fcfd = () => interopDefault(import('..\\pages\\resignfromwork\\index.vue' /* webpackChunkName: "pages/resignfromwork/index" */))
const _2230f188 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))
const _6e423c1e = () => interopDefault(import('..\\pages\\home\\_id.vue' /* webpackChunkName: "pages/home/_id" */))

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
    component: _03c6bf5d,
    name: "admin"
  }, {
    path: "/leaveabsence",
    component: _7e0f5e22,
    name: "leaveabsence"
  }, {
    path: "/leaveoutside",
    component: _e9360c8c,
    name: "leaveoutside"
  }, {
    path: "/listrequests",
    component: _586985e6,
    name: "listrequests"
  }, {
    path: "/login",
    component: _46461f03,
    name: "login"
  }, {
    path: "/login-admin",
    component: _18a813c1,
    name: "login-admin"
  }, {
    path: "/profile",
    component: _c02b477a,
    name: "profile"
  }, {
    path: "/resignfromwork",
    component: _1ce3fcfd,
    name: "resignfromwork"
  }, {
    path: "/",
    component: _2230f188,
    name: "index"
  }, {
    path: "/home/:id?",
    component: _6e423c1e,
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
