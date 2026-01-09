import localforage from 'localforage'

// 配置 LocalForage
localforage.config({
  name: 'LawyerCalendar',
  storeName: 'calendar_data'
})

// 数据存储键
const STORAGE_KEYS = {
  USERS: 'users',
  LOCATIONS: 'locations',
  SCHEDULES: 'schedules',
  SETTINGS: 'settings'
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 用户数据操作
export const userStorage = {
  // 获取所有用户
  async getAll() {
    try {
      const users = await localforage.getItem(STORAGE_KEYS.USERS) || []
      return users.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    } catch (error) {
      console.error('获取用户数据失败:', error)
      return []
    }
  },

  // 根据ID获取用户
  async getById(id) {
    try {
      const users = await this.getAll()
      return users.find(user => user.id === id)
    } catch (error) {
      console.error('获取用户失败:', error)
      return null
    }
  },

  // 添加用户
  async add(userData) {
    try {
      const users = await this.getAll()
      // 创建新用户时，确保使用新生成的唯一ID，忽略传入的id（如果有的话）
      const { id, ...dataWithoutId } = userData
      const newUser = {
        id: generateId(),
        ...dataWithoutId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      users.push(newUser)
      await localforage.setItem(STORAGE_KEYS.USERS, users)
      return newUser
    } catch (error) {
      console.error('添加用户失败:', error)
      throw error
    }
  },

  // 更新用户
  async update(id, userData) {
    try {
      const users = await this.getAll()
      const index = users.findIndex(user => user.id === id)
      if (index === -1) throw new Error('用户不存在')

      users[index] = {
        ...users[index],
        ...userData,
        updatedAt: new Date().toISOString()
      }
      await localforage.setItem(STORAGE_KEYS.USERS, users)
      return users[index]
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  },

  // 删除用户
  async delete(id) {
    try {
      const users = await this.getAll()
      const filteredUsers = users.filter(user => user.id !== id)
      await localforage.setItem(STORAGE_KEYS.USERS, filteredUsers)
      return true
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  },

  // 搜索用户
  async search(query) {
    try {
      const users = await this.getAll()
      const lowerQuery = query.toLowerCase()
      return users.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.phone.toLowerCase().includes(lowerQuery)
      )
    } catch (error) {
      console.error('搜索用户失败:', error)
      return []
    }
  }
}

// 日程数据操作
export const scheduleStorage = {
  // 获取所有日程
  async getAll() {
    try {
      const schedules = await localforage.getItem(STORAGE_KEYS.SCHEDULES) || []
      return schedules.sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    } catch (error) {
      console.error('获取日程数据失败:', error)
      return []
    }
  },

  // 根据ID获取日程
  async getById(id) {
    try {
      const schedules = await this.getAll()
      return schedules.find(schedule => schedule.id === id)
    } catch (error) {
      console.error('获取日程失败:', error)
      return null
    }
  },

  // 根据用户ID获取日程
  async getByUserId(userId) {
    try {
      const schedules = await this.getAll()
      return schedules.filter(schedule => schedule.userId === userId)
    } catch (error) {
      console.error('获取用户日程失败:', error)
      return []
    }
  },

  // 添加日程
  async add(scheduleData) {
    try {
      const schedules = await this.getAll()
      // 创建新日程时，确保使用新生成的唯一ID，忽略传入的id（如果有的话）
      const { id, ...dataWithoutId } = scheduleData
      const newSchedule = {
        id: generateId(),
        ...dataWithoutId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      schedules.push(newSchedule)
      await localforage.setItem(STORAGE_KEYS.SCHEDULES, schedules)
      return newSchedule
    } catch (error) {
      console.error('添加日程失败:', error)
      throw error
    }
  },

  // 更新日程
  async update(id, scheduleData) {
    try {
      const schedules = await this.getAll()
      const index = schedules.findIndex(schedule => schedule.id === id)
      if (index === -1) throw new Error('日程不存在')

      schedules[index] = {
        ...schedules[index],
        ...scheduleData,
        updatedAt: new Date().toISOString()
      }
      await localforage.setItem(STORAGE_KEYS.SCHEDULES, schedules)
      return schedules[index]
    } catch (error) {
      console.error('更新日程失败:', error)
      throw error
    }
  },

  // 删除日程
  async delete(id) {
    try {
      const schedules = await this.getAll()
      const filteredSchedules = schedules.filter(schedule => schedule.id !== id)
      await localforage.setItem(STORAGE_KEYS.SCHEDULES, filteredSchedules)
      return true
    } catch (error) {
      console.error('删除日程失败:', error)
      throw error
    }
  },

  // 批量删除日程
  async deleteMultiple(ids) {
    try {
      const schedules = await this.getAll()
      const filteredSchedules = schedules.filter(schedule => !ids.includes(schedule.id))
      await localforage.setItem(STORAGE_KEYS.SCHEDULES, filteredSchedules)
      return true
    } catch (error) {
      console.error('批量删除日程失败:', error)
      throw error
    }
  },

  // 获取指定时间范围内的日程
  async getByDateRange(startDate, endDate) {
    try {
      const schedules = await this.getAll()
      return schedules.filter(schedule => {
        const scheduleStart = new Date(schedule.startTime)
        const scheduleEnd = new Date(schedule.endTime)
        const rangeStart = new Date(startDate)
        const rangeEnd = new Date(endDate)

        return scheduleStart < rangeEnd && scheduleEnd > rangeStart
      })
    } catch (error) {
      console.error('获取日期范围日程失败:', error)
      return []
    }
  }
}

// 地点数据操作
export const locationStorage = {
  // 获取所有地点
  async getAll() {
    try {
      const locations = await localforage.getItem(STORAGE_KEYS.LOCATIONS) || []
      return locations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    } catch (error) {
      console.error('获取地点数据失败:', error)
      return []
    }
  },

  // 根据ID获取地点
  async getById(id) {
    try {
      const locations = await this.getAll()
      return locations.find(location => location.id === id)
    } catch (error) {
      console.error('获取地点失败:', error)
      return null
    }
  },

  // 添加地点
  async add(locationData) {
    try {
      const locations = await this.getAll()
      // 创建新地点时，确保使用新生成的唯一ID，忽略传入的id（如果有的话）
      const { id, ...dataWithoutId } = locationData
      const newLocation = {
        id: generateId(),
        ...dataWithoutId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      locations.push(newLocation)
      await localforage.setItem(STORAGE_KEYS.LOCATIONS, locations)
      return newLocation
    } catch (error) {
      console.error('添加地点失败:', error)
      throw error
    }
  },

  // 更新地点
  async update(id, locationData) {
    try {
      const locations = await this.getAll()
      const index = locations.findIndex(location => location.id === id)
      if (index === -1) throw new Error('地点不存在')

      locations[index] = {
        ...locations[index],
        ...locationData,
        updatedAt: new Date().toISOString()
      }
      await localforage.setItem(STORAGE_KEYS.LOCATIONS, locations)
      return locations[index]
    } catch (error) {
      console.error('更新地点失败:', error)
      throw error
    }
  },

  // 删除地点
  async delete(id) {
    try {
      const locations = await this.getAll()
      const filteredLocations = locations.filter(location => location.id !== id)
      await localforage.setItem(STORAGE_KEYS.LOCATIONS, filteredLocations)
      return true
    } catch (error) {
      console.error('删除地点失败:', error)
      throw error
    }
  },

  // 搜索地点
  async search(query) {
    try {
      const locations = await this.getAll()
      const lowerQuery = query.toLowerCase()
      return locations.filter(location =>
        location.name.toLowerCase().includes(lowerQuery) ||
        location.address.toLowerCase().includes(lowerQuery)
      )
    } catch (error) {
      console.error('搜索地点失败:', error)
      return []
    }
  }
}

// 系统设置操作
export const settingsStorage = {
  // 获取设置
  async get() {
    try {
      return await localforage.getItem(STORAGE_KEYS.SETTINGS) || {
        calendarView: 'dayGridMonth',
        theme: 'light',
        exportPath: ''
      }
    } catch (error) {
      console.error('获取设置失败:', error)
      return {
        calendarView: 'dayGridMonth',
        theme: 'light',
        exportPath: ''
      }
    }
  },

  // 更新设置
  async update(settings) {
    try {
      const currentSettings = await this.get()
      const newSettings = { ...currentSettings, ...settings }
      await localforage.setItem(STORAGE_KEYS.SETTINGS, newSettings)
      return newSettings
    } catch (error) {
      console.error('更新设置失败:', error)
      throw error
    }
  }
}

// 数据导出
export const dataExport = {
  // 导出所有数据
  async exportAll() {
    try {
      const users = await userStorage.getAll()
      const locations = await locationStorage.getAll()
      const schedules = await scheduleStorage.getAll()
      const settings = await settingsStorage.get()

      return {
        users,
        locations,
        schedules,
        settings,
        exportTime: new Date().toISOString()
      }
    } catch (error) {
      console.error('导出数据失败:', error)
      throw error
    }
  },

  // 下载JSON文件
  downloadJson(data, filename = 'lawyer-calendar-data.json') {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }
}
