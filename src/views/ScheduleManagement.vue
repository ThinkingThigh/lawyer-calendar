<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { scheduleStorage, userStorage } from '../services/storage.js'
import { Schedule, STATUS_OPTIONS, PRIORITY_OPTIONS } from '../models/types.js'
import ScheduleDialog from '../components/ScheduleDialog.vue'
import { Search } from '@element-plus/icons-vue'
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

const schedules = ref([])
const users = ref([])
const searchQuery = ref('')
const selectedUserId = ref('')
const userSearchQuery = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('添加日程')
const isEditMode = ref(false)
const selectedSchedules = ref([])

// 表单数据
const scheduleForm = ref(new Schedule())

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value

  const query = userSearchQuery.value.toLowerCase()
  return users.value.filter(user =>
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

  // 按关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(schedule =>
      schedule.title.toLowerCase().includes(query) ||
      schedule.description.toLowerCase().includes(query) ||
      schedule.location.toLowerCase().includes(query)
    )
  }

  return result
})

// 加载数据
const loadData = async () => {
  try {
    const [scheduleData, userData] = await Promise.all([
      scheduleStorage.getAll(),
      userStorage.getAll()
    ])
    schedules.value = scheduleData
    users.value = userData
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 添加日程
const addSchedule = () => {
  resetForm()
  dialogTitle.value = '添加日程'
  isEditMode.value = false
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
  const user = users.value.find(u => u.id === userId)
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
  return option ? { text: option.label, color: option.color } : { text: status, color: '#409EFF' }
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
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
}

onMounted(() => {
  loadData()
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
          placeholder="搜索日程标题、描述或地点"
          clearable
          style="width: 300px; margin-right: 10px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="selectedUserId"
          placeholder="选择用户"
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
            :label="`${user.name} (${user.phone})`"
            :value="user.id"
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

        <el-table-column prop="title" label="标题" min-width="150" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.title }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="startTime" label="开始时间" width="160" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.startTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="endTime" label="结束时间" width="160" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.endTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="userId" label="关联用户" width="100">
          <template #default="scope">
            {{ getUserName(scope.row.userId) }}
          </template>
        </el-table-column>

        <el-table-column prop="location" label="地点" width="120">
          <template #default="scope">
            {{ scope.row.location || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="优先级" width="80">
          <template #default="scope">
            <el-tag :color="getPriorityTag(scope.row.priority).color">
              {{ getPriorityTag(scope.row.priority).text }}
            </el-tag>
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
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :is-edit-mode="isEditMode"
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
