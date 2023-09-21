/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createRouter, createWebHistory } from "vue-router"
const Editor = () => import("./pages/Editor.vue")
const Preference = () => import("./pages/Pref.vue")
const routes = [
  { path: "/", component: Editor },
  { path: "/pref", component: Preference },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
