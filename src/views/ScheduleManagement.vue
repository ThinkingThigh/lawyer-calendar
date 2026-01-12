<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useUserStore } from '../stores/userStore.js'
import { scheduleStorage, userStorage, locationStorage } from '../services/storage.js'
import { Schedule, STATUS_OPTIONS, PRIORITY_OPTIONS, EVENT_TYPE_OPTIONS } from '../models/types.js'
import ScheduleDialog from '../components/ScheduleDialog.vue'
import { Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import {
  ElCard,
  ElButton,
  ElTable,
  ElTableColumn,
  ElInput,
  ElSelect,
  ElOption,
  ElTag,
  ElMessage,
  ElPopconfirm,
  ElCheckbox
} from 'element-plus'

// 使用Pinia store
const userStore = useUserStore()

const schedules = ref([])
const locations = ref([])
const searchQuery = ref('')
const selectedUserId = ref('')
const userSearchQuery = ref('')
const selectedEventType = ref('')
const selectedLocationId = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('添加日程')
const isEditMode = ref(false)
const selectedSchedules = ref([])

// 对话框key，用于强制重新渲染
const dialogKey = ref(0)

// 表单数据
const scheduleForm = ref(new Schedule())

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return userStore.users

  const query = userSearchQuery.value.toLowerCase()
  return userStore.users.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.phone.toLowerCase().includes(query)
  )
})

// 过滤后的日程列表
const filteredSchedules = computed(() => {
  let result = schedules.value

  // 按用户过滤
  if (selectedUserId.value) {
    result = result.filter(schedule => schedule.userId === selectedUserId.value)
  }

  // 按事件类型过滤
  if (selectedEventType.value) {
    result = result.filter(schedule => schedule.eventType === selectedEventType.value)
  }

  // 按地点过滤
  if (selectedLocationId.value) {
    result = result.filter(schedule => {
      const locationName = getLocationName(schedule)
      const selectedLocation = locations.value.find(loc => loc.id === selectedLocationId.value)
      return selectedLocation ? locationName === selectedLocation.name : false
    })
  }

  // 按关键词搜索（只搜索标题和描述）
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(schedule =>
      schedule.title.toLowerCase().includes(query) ||
      schedule.description.toLowerCase().includes(query)
    )
  }

  return result
})

// 加载数据
const loadData = async () => {
  try {
    const [scheduleData, locationData] = await Promise.all([
      scheduleStorage.getAll(),
      locationStorage.getAll()
    ])
    schedules.value = scheduleData
    locations.value = locationData

    // 从store加载用户数据
    await userStore.fetchUsers()
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 重置表单
const resetForm = () => {
  console.log('🔄 resetForm被调用')
  scheduleForm.value = new Schedule()
  console.log('📝 重置后的scheduleForm:', scheduleForm.value)
}

// 添加日程
const addSchedule = () => {
  resetForm()

  // 设置默认值为当前时间和当前时间+30分钟
  const now = dayjs()
  scheduleForm.value.startTime = now.format('YYYY-MM-DD HH:mm')
  scheduleForm.value.endTime = now.add(30, 'minute').format('YYYY-MM-DD HH:mm')

  dialogTitle.value = '添加日程'
  isEditMode.value = false
  dialogKey.value++ // 强制重新渲染对话框
  dialogVisible.value = true
}

// 编辑日程
const editSchedule = async (schedule) => {
  scheduleForm.value = { ...schedule }
  dialogTitle.value = '编辑日程'
  isEditMode.value = true
  await nextTick()
  dialogVisible.value = true
}

// 处理删除日程
const handleDeleteSchedule = async (scheduleData) => {
  try {
    await scheduleStorage.delete(scheduleData.id)
    ElMessage.success('日程删除成功')
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error('删除日程失败')
  }
}

// 处理新客户创建
const handleClientCreated = async (newClient) => {
  console.log('👨‍👩‍👧‍👦 父组件收到新客户:', newClient)

  // 通过store添加用户（这会自动更新store中的users）
  await userStore.addUser(newClient)

  // 强制重新渲染对话框
  dialogKey.value++

  console.log('🔑 对话框key:', dialogKey.value)
}

// 批量删除
const deleteSelected = async () => {
  if (selectedSchedules.value.length === 0) {
    ElMessage.warning('请选择要删除的日程')
    return
  }

  try {
    await scheduleStorage.deleteMultiple(selectedSchedules.value)
    ElMessage.success(`成功删除 ${selectedSchedules.value.length} 个日程`)
    selectedSchedules.value = []
    await loadData()
  } catch (error) {
    ElMessage.error('批量删除失败')
  }
}

// 处理保存日程
const handleSaveSchedule = async (scheduleData) => {
  try {
    if (isEditMode.value) {
      await scheduleStorage.update(scheduleData.id, scheduleData)
      ElMessage.success('日程更新成功')
    } else {
      await scheduleStorage.add(scheduleData)
      ElMessage.success('日程添加成功')
    }

    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新失败' : '添加失败')
  }
}


// 获取用户姓名
const getUserName = (userId) => {
  if (!userId) return '-'
  const user = userStore.users.find(u => u.id === userId)
  return user ? user.name : '未知用户'
}

// 获取优先级标签
const getPriorityTag = (priority) => {
  const option = PRIORITY_OPTIONS.find(p => p.value === priority)
  return option ? { text: option.label, color: option.color } : { text: priority, color: '#409EFF' }
}

// 获取状态标签
const getStatusTag = (status) => {
  const option = STATUS_OPTIONS.find(s => s.value === status)
  return option ? { text: option.label, color: option.color } : { text: status, color: '#409EFF'   }
}

// 获取地点名称
const getLocationName = (schedule) => {
  // 如果有locationId，优先使用ID查找地点名称
  if (schedule.locationId) {
    const location = locations.value.find(loc => loc.id === schedule.locationId)
    return location ? location.name : schedule.location || ''
  }
  // 如果没有locationId，使用location字段（向后兼容）
  return schedule.location || ''
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN')
}

// 表格选择处理
const handleSelectionChange = (selection) => {
  selectedSchedules.value = selection.map(item => item.id)
}

// 搜索用户
const searchUsers = (query) => {
  userSearchQuery.value = query
}

// 清空搜索条件
const clearSearch = () => {
  searchQuery.value = ''
  selectedUserId.value = ''
  userSearchQuery.value = ''
  selectedEventType.value = ''
  selectedLocationId.value = ''
}

// 提供给子组件调用的方法
const addNewClient = (newClient) => {
  console.log('🔗 通过provide调用addNewClient:', newClient)
  handleClientCreated(newClient)
}

// 使用Pinia store管理用户数据

// 监听自定义事件
if (typeof window !== 'undefined') {
  const handleCustomEvent = (event) => {
    console.log('🎧 收到自定义事件:', event.detail)
    handleClientCreated(event.detail)
  }

  window.addEventListener('schedule-dialog-client-created', handleCustomEvent)

  // 在组件卸载时移除监听器
  onUnmounted(() => {
    window.removeEventListener('schedule-dialog-client-created', handleCustomEvent)
  })
}

// 在mounted时加载数据
onMounted(async () => {
  console.log('🚀 ScheduleManagement组件已挂载')

  await loadData()
  console.log('📊 初始用户数量:', userStore.users.length)
})
</script>

<template>
  <div class="schedule-management">
    <el-card class="schedule-card">
      <template #header>
        <div class="card-header">
          <h2>日程管理</h2>
          <div class="header-actions">
            <el-button
              v-if="selectedSchedules.length > 0"
              type="danger"
              @click="deleteSelected"
            >
              批量删除 ({{ selectedSchedules.length }})
            </el-button>
            <el-button type="primary" @click="addSchedule">
              添加日程
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索日程标题或描述"
          clearable
          style="width: 300px; margin-right: 10px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="selectedUserId"
          placeholder="选择客户"
          filterable
          remote
          :remote-method="searchUsers"
          clearable
          style="width: 200px; margin-right: 10px"
          @clear="userSearchQuery = ''"
        >
          <el-option
            v-for="user in filteredUsers"
            :key="user.id"
            :label="`${user.name} (${user.phone || '无电话'})`"
            :value="user.id"
          />
        </el-select>

        <el-select
          v-model="selectedEventType"
          placeholder="选择事件类型"
          clearable
          style="width: 150px; margin-right: 10px"
        >
          <el-option
            v-for="option in EVENT_TYPE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-select
          v-model="selectedLocationId"
          placeholder="选择地点"
          clearable
          style="width: 150px; margin-right: 10px"
        >
          <el-option
            v-for="location in locations"
            :key="location.id"
            :label="location.name"
            :value="location.id"
          />
        </el-select>

        <el-button @click="clearSearch" type="default">
          清空搜索
        </el-button>
      </div>

      <!-- 日程列表 -->
      <el-table
        ref="scheduleTable"
        :data="filteredSchedules"
        style="width: 100%"
        stripe
        @selection-change="handleSelectionChange"
        :default-sort="{prop: 'startTime', order: 'descending'}"
      >
        <el-table-column type="selection" width="55" />

        <el-table-column prop="title" label="标题" min-width="120" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.title }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="scope">
            <span
              :title="scope.row.description"
              style="display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
            >
              {{ scope.row.description || '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="startTime" label="开始时间" width="140" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.startTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="endTime" label="结束时间" width="140" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="userId" label="客户" width="90">
          <template #default="scope">
            {{ getUserName(scope.row.userId) }}
          </template>
        </el-table-column>

        <el-table-column prop="location" label="地点" width="100">
          <template #default="scope">
            {{ getLocationName(scope.row) || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="状态" width="80">
          <template #default="scope">
            <el-tag :color="getStatusTag(scope.row.status).color">
              {{ getStatusTag(scope.row.status).text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="editSchedule(scope.row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除这个日程吗？"
              @confirm="deleteSchedule(scope.row)"
            >
              <template #reference>
                <el-button size="small" type="danger">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 日程对话框组件 -->
    <ScheduleDialog
      :key="dialogKey"
      :visible="dialogVisible"
      @update:visible="dialogVisible = $event"
      :title="dialogTitle"
      :is-edit-mode="isEditMode"
      :users="userStore.users"
      :model-value="scheduleForm"
      @update:model-value="scheduleForm = $event"
      @save="handleSaveSchedule"
      @delete="handleDeleteSchedule"
    />
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
export default {
  components: {
    Search
  }
}
</script>

<style scoped>
.schedule-management {
  height: 100%;
}

.schedule-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-bar {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
