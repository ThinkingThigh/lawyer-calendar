import { createApp } from 'vue'
import router from './router.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import reminderService from './services/reminder.js'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

// 初始化提醒服务
reminderService.init()

app.mount('#app')
