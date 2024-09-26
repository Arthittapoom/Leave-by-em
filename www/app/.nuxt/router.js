import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _5d8dc199 = () => interopDefault(import('..\\pages\\admin\\index.vue' /* webpackChunkName: "pages/admin/index" */))
const _0188a066 = () => interopDefault(import('..\\pages\\leaveabsence\\index.vue' /* webpackChunkName: "pages/leaveabsence/index" */))
const _0ede3bfe = () => interopDefault(import('..\\pages\\leaveoutside\\index.vue' /* webpackChunkName: "pages/leaveoutside/index" */))
const _483a6fac = () => interopDefault(import('..\\pages\\listrequests\\index.vue' /* webpackChunkName: "pages/listrequests/index" */))
const _bfe5bd82 = () => interopDefault(import('..\\pages\\login\\index.vue' /* webpackChunkName: "pages/login/index" */))
const _18c90e06 = () => interopDefault(import('..\\pages\\login-admin\\index.vue' /* webpackChunkName: "pages/login-admin/index" */))
const _b80c8102 = () => interopDefault(import('..\\pages\\profile\\index.vue' /* webpackChunkName: "pages/profile/index" */))
const _b1d4837e = () => interopDefault(import('..\\pages\\resignfromwork\\index.vue' /* webpackChunkName: "pages/resignfromwork/index" */))
const _30148a68 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))
const _20d56935 = () => interopDefault(import('..\\pages\\home\\_id.vue' /* webpackChunkName: "pages/home/_id" */))

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
    component: _5d8dc199,
    name: "admin"
  }, {
    path: "/leaveabsence",
    component: _0188a066,
    name: "leaveabsence"
  }, {
    path: "/leaveoutside",
    component: _0ede3bfe,
    name: "leaveoutside"
  }, {
    path: "/listrequests",
    component: _483a6fac,
    name: "listrequests"
  }, {
    path: "/login",
    component: _bfe5bd82,
    name: "login"
  }, {
    path: "/login-admin",
    component: _18c90e06,
    name: "login-admin"
  }, {
    path: "/profile",
    component: _b80c8102,
    name: "profile"
  }, {
    path: "/resignfromwork",
    component: _b1d4837e,
    name: "resignfromwork"
  }, {
    path: "/",
    component: _30148a68,
    name: "index"
  }, {
    path: "/home/:id?",
    component: _20d56935,
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
