import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userStorage } from '../services/storage.js'

export const useUserStore = defineStore('user', () => {
  // 状态
  const users = ref([])
  const loading = ref(false)

  // 获取所有用户
  const fetchUsers = async () => {
    try {
      loading.value = true
      users.value = await userStorage.getAll()
      console.log('📊 用户store: 已加载用户数量', users.value.length)
    } catch (error) {
      console.error('获取用户失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 添加用户
  const addUser = async (userData) => {
    try {
      console.log('📝 用户store: 添加新用户', userData.name)
      const newUser = await userStorage.add(userData)

      // 更新本地状态
      users.value.push(newUser)

      console.log('✅ 用户store: 用户添加成功', newUser.name)
      return newUser
    } catch (error) {
      console.error('添加用户失败:', error)
      throw error
    }
  }

  // 更新用户
  const updateUser = async (id, userData) => {
    try {
      const updatedUser = await userStorage.update(id, userData)

      // 更新本地状态
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }

      return updatedUser
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  // 删除用户
  const deleteUser = async (id) => {
    try {
      await userStorage.delete(id)

      // 更新本地状态
      users.value = users.value.filter(u => u.id !== id)
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  // 根据ID查找用户
  const getUserById = (id) => {
    return users.value.find(u => u.id === id)
  }

  return {
    // 状态
    users,
    loading,

    // 方法
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    getUserById
  }
})
