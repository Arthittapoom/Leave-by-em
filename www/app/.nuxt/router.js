import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _9cfce9e6 = () => interopDefault(import('..\\pages\\admin\\index.vue' /* webpackChunkName: "pages/admin/index" */))
const _770de71c = () => interopDefault(import('..\\pages\\leaveabsence\\index.vue' /* webpackChunkName: "pages/leaveabsence/index" */))
const _5c62afec = () => interopDefault(import('..\\pages\\leaveoutside\\index.vue' /* webpackChunkName: "pages/leaveoutside/index" */))
const _c2599794 = () => interopDefault(import('..\\pages\\listrequests\\index.vue' /* webpackChunkName: "pages/listrequests/index" */))
const _17fe2a9a = () => interopDefault(import('..\\pages\\login\\index.vue' /* webpackChunkName: "pages/login/index" */))
const _02275b71 = () => interopDefault(import('..\\pages\\login-admin\\index.vue' /* webpackChunkName: "pages/login-admin/index" */))
const _6bbe081a = () => interopDefault(import('..\\pages\\profile\\index.vue' /* webpackChunkName: "pages/profile/index" */))
const _6f9b574d = () => interopDefault(import('..\\pages\\resignfromwork\\index.vue' /* webpackChunkName: "pages/resignfromwork/index" */))
const _b1f22850 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))
const _bae1977e = () => interopDefault(import('..\\pages\\home\\_id.vue' /* webpackChunkName: "pages/home/_id" */))

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
    component: _9cfce9e6,
    name: "admin"
  }, {
    path: "/leaveabsence",
    component: _770de71c,
    name: "leaveabsence"
  }, {
    path: "/leaveoutside",
    component: _5c62afec,
    name: "leaveoutside"
  }, {
    path: "/listrequests",
    component: _c2599794,
    name: "listrequests"
  }, {
    path: "/login",
    component: _17fe2a9a,
    name: "login"
  }, {
    path: "/login-admin",
    component: _02275b71,
    name: "login-admin"
  }, {
    path: "/profile",
    component: _6bbe081a,
    name: "profile"
  }, {
    path: "/resignfromwork",
    component: _6f9b574d,
    name: "resignfromwork"
  }, {
    path: "/",
    component: _b1f22850,
    name: "index"
  }, {
    path: "/home/:id?",
    component: _bae1977e,
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
