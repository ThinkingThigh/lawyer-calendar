import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import reminderService from './services/reminder.js'
import { userStorage } from './services/storage.js'

// 初始化默认数据
const initDefaultData = async () => {
  try {
    // 延迟导入userStore，避免循环依赖
    const { useUserStore } = await import('./stores/userStore.js')
    const userStore = useUserStore(pinia)

    const users = await userStorage.getAll()
    if (users.length === 0) {
      // 如果没有用户数据，创建一些默认用户
      await userStorage.add({
        name: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        address: '北京市朝阳区'
      })
      await userStorage.add({
        name: '李四',
        phone: '13800138001',
        email: 'lisi@example.com',
        address: '上海市浦东新区'
      })
      await userStorage.add({
        name: '王五',
        phone: '13800138002',
        email: 'wangwu@example.com',
        address: '广州市天河区'
      })
      console.log('已创建默认用户数据')
    }

    // 初始化userStore数据
    await userStore.fetchUsers()
    console.log('📊 已初始化用户store数据')
  } catch (error) {
    console.error('初始化默认数据失败:', error)
  }
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化提醒服务
reminderService.init()

// 初始化默认数据
initDefaultData()

app.mount('#app')
