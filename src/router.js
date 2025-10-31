import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from './views/CalendarView.vue'
import UserManagement from './views/UserManagement.vue'
import ScheduleManagement from './views/ScheduleManagement.vue'
import UserDetail from './views/UserDetail.vue'
import Settings from './views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Calendar',
    component: CalendarView
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement
  },
  {
    path: '/users/:id',
    name: 'UserDetail',
    component: UserDetail,
    props: true
  },
  {
    path: '/schedules',
    name: 'ScheduleManagement',
    component: ScheduleManagement
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
