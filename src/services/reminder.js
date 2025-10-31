// 日程提醒服务
import { scheduleStorage } from './storage.js'

class ReminderService {
  constructor() {
    this.checkInterval = null
    this.permissionGranted = false
    this.isRunning = false
  }

  // 初始化提醒服务
  async init() {
    // 请求通知权限
    await this.requestPermission()

    // 开始定时检查
    this.startChecking()

    console.log('提醒服务已启动')
  }

  // 请求浏览器通知权限
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持通知功能')
      return false
    }

    try {
      // 检查是否已经有权限，避免重复请求
      if (Notification.permission === 'granted') {
        this.permissionGranted = true
        console.log('通知权限已获取')
        return true
      }

      if (Notification.permission === 'denied') {
        this.permissionGranted = false
        console.warn('通知权限已被拒绝')
        return false
      }

      // 请求权限 - 使用Promise包装以避免异步问题
      const permission = await new Promise((resolve) => {
        try {
          const result = Notification.requestPermission()
          // 现代浏览器返回Promise
          if (result && typeof result.then === 'function') {
            result.then(resolve)
          } else {
            // 旧版浏览器直接返回值
            resolve(result)
          }
        } catch (error) {
          console.warn('权限请求失败:', error)
          resolve('denied')
        }
      })

      this.permissionGranted = permission === 'granted'

      if (this.permissionGranted) {
        console.log('通知权限已获取')
      } else {
        console.warn('通知权限被拒绝')
      }

      return this.permissionGranted
    } catch (error) {
      console.error('获取通知权限失败:', error)
      // 如果是扩展相关的错误，尝试降级处理
      if (error.message && error.message.includes('extension')) {
        console.warn('检测到浏览器扩展冲突，提醒功能可能受限')
        return false
      }
      return false
    }
  }

  // 开始定时检查
  startChecking() {
    if (this.isRunning) return

    this.isRunning = true

    // 每分钟检查一次
    this.checkInterval = setInterval(() => {
      this.checkUpcomingSchedules()
    }, 60000) // 60秒

    // 页面加载后立即检查一次
    this.checkUpcomingSchedules()
  }

  // 停止定时检查
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.isRunning = false
    console.log('提醒服务已停止')
  }

  // 检查即将到来的日程
  async checkUpcomingSchedules() {
    if (!this.permissionGranted) return

    try {
      const schedules = await scheduleStorage.getAll()
      const now = new Date()
      const currentTime = now.getTime()

      schedules.forEach(schedule => {
        const scheduleTime = new Date(schedule.startTime).getTime()
        const reminderMinutes = schedule.reminder

        // 如果没有设置提醒，跳过
        if (reminderMinutes === 0) return

        // 计算提醒触发时间
        const reminderTime = scheduleTime - (reminderMinutes * 60 * 1000)

        // 检查是否在提醒时间范围内（前后1分钟）
        const timeDiff = Math.abs(currentTime - reminderTime)

        if (timeDiff <= 60000) { // 1分钟内
          // 检查是否已经提醒过（避免重复提醒）
          if (!this.isAlreadyReminded(schedule.id, reminderTime)) {
            this.showNotification(schedule)
            this.markAsReminded(schedule.id, reminderTime)
          }
        }
      })
    } catch (error) {
      console.error('检查日程提醒失败:', error)
    }
  }

  // 显示通知
  showNotification(schedule) {
    if (!this.permissionGranted) {
      console.warn('通知权限未获取，无法显示提醒')
      return
    }

    try {
      const title = `日程提醒: ${schedule.title}`
      const options = {
        body: `开始时间: ${this.formatDateTime(schedule.startTime)}\n${schedule.description || ''}\n\n点击查看详情`,
        icon: '/vite.svg', // 可以替换为应用图标
        badge: '/vite.svg',
        tag: `schedule-${schedule.id}`, // 避免重复通知
        requireInteraction: true // 需要用户手动关闭
      }

      const notification = new Notification(title, options)

    // 点击通知跳转到日程详情
    notification.onclick = () => {
      // 如果应用在后台，聚焦到应用
      window.focus()

      // 可以在这里添加跳转逻辑，比如打开日程编辑对话框
      // 这里需要通过事件总线或者全局状态来通知应用打开相应的日程
      console.log('点击通知，查看日程:', schedule.id)

      notification.close()
    }

      // 自动关闭通知（30秒后）
      setTimeout(() => {
        notification.close()
      }, 30000)

    } catch (error) {
      console.error('显示通知失败:', error)
      // 如果是actions相关的错误，提供友好的提示
      if (error.message.includes('actions')) {
        console.warn('浏览器不支持通知操作按钮，已移除该功能')
      }
    }
  }

  // 格式化日期时间显示
  formatDateTime(dateString) {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 检查是否已经提醒过
  isAlreadyReminded(scheduleId, reminderTime) {
    const remindedKey = `reminded_${scheduleId}_${reminderTime}`
    const reminded = localStorage.getItem(remindedKey)
    return reminded !== null
  }

  // 标记为已提醒
  markAsReminded(scheduleId, reminderTime) {
    const remindedKey = `reminded_${scheduleId}_${reminderTime}`
    const expireTime = Date.now() + (24 * 60 * 60 * 1000) // 24小时后过期
    localStorage.setItem(remindedKey, expireTime.toString())

    // 清理过期的提醒记录
    this.cleanupExpiredReminders()
  }

  // 清理过期的提醒记录
  cleanupExpiredReminders() {
    const now = Date.now()
    const keys = Object.keys(localStorage)

    keys.forEach(key => {
      if (key.startsWith('reminded_')) {
        const expireTime = parseInt(localStorage.getItem(key))
        if (now > expireTime) {
          localStorage.removeItem(key)
        }
      }
    })
  }

  // 获取通知权限状态
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported'
    }
    return Notification.permission
  }

  // 销毁服务
  destroy() {
    this.stopChecking()
  }
}

// 创建单例实例
const reminderService = new ReminderService()

export default reminderService
