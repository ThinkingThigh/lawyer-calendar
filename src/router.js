import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from './views/CalendarView.vue'
import ClientManagement from './views/ClientManagement.vue'
import ScheduleManagement from './views/ScheduleManagement.vue'
import ClientDetail from './views/ClientDetail.vue'
import Settings from './views/Settings.vue'

const routes = [
  {
    path: '/',
    name: 'Calendar',
    component: CalendarView
  },
  {
    path: '/users',
    name: 'ClientManagement',
    component: ClientManagement
  },
  {
    path: '/users/:id',
    name: 'ClientDetail',
    component: ClientDetail,
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
