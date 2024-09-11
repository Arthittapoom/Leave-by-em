import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _98ab9d94 = () => interopDefault(import('..\\pages\\admin\\index.vue' /* webpackChunkName: "pages/admin/index" */))
const _2b79d629 = () => interopDefault(import('..\\pages\\leaveabsence\\index.vue' /* webpackChunkName: "pages/leaveabsence/index" */))
const _38cf71c1 = () => interopDefault(import('..\\pages\\leaveoutside\\index.vue' /* webpackChunkName: "pages/leaveoutside/index" */))
const _05d3fded = () => interopDefault(import('..\\pages\\listrequests\\index.vue' /* webpackChunkName: "pages/listrequests/index" */))
const _13acde48 = () => interopDefault(import('..\\pages\\login\\index.vue' /* webpackChunkName: "pages/login/index" */))
const _ecca024c = () => interopDefault(import('..\\pages\\login-admin\\index.vue' /* webpackChunkName: "pages/login-admin/index" */))
const _368e8848 = () => interopDefault(import('..\\pages\\profile\\index.vue' /* webpackChunkName: "pages/profile/index" */))
const _19908f44 = () => interopDefault(import('..\\pages\\resignfromwork\\index.vue' /* webpackChunkName: "pages/resignfromwork/index" */))
const _407e1c62 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))
const _425766b8 = () => interopDefault(import('..\\pages\\home\\_id.vue' /* webpackChunkName: "pages/home/_id" */))

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
    component: _98ab9d94,
    name: "admin"
  }, {
    path: "/leaveabsence",
    component: _2b79d629,
    name: "leaveabsence"
  }, {
    path: "/leaveoutside",
    component: _38cf71c1,
    name: "leaveoutside"
  }, {
    path: "/listrequests",
    component: _05d3fded,
    name: "listrequests"
  }, {
    path: "/login",
    component: _13acde48,
    name: "login"
  }, {
    path: "/login-admin",
    component: _ecca024c,
    name: "login-admin"
  }, {
    path: "/profile",
    component: _368e8848,
    name: "profile"
  }, {
    path: "/resignfromwork",
    component: _19908f44,
    name: "resignfromwork"
  }, {
    path: "/",
    component: _407e1c62,
    name: "index"
  }, {
    path: "/home/:id?",
    component: _425766b8,
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
