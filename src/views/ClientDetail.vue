<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userStorage, scheduleStorage, locationStorage, customerTypeStorage } from '../services/storage.js'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, Schedule } from '../models/types.js'
import { useUserStore } from '../stores/userStore.js'
import ScheduleDialog from '../components/ScheduleDialog.vue'
import {
  ElCard,
  ElRow,
  ElCol,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElEmpty,
  ElMessage,
  ElPopconfirm
} from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const user = ref(null)
const userSchedules = ref([])
const customerTypes = ref([])
const loading = ref(true)
const scheduleDialogVisible = ref(false)
const scheduleDialogTitle = ref('添加日程')
const isEditMode = ref(false)
const currentSchedule = ref(new Schedule())

// 加载客户数据
const loadUserData = async () => {
  try {
    const userId = route.params.id
    user.value = await userStorage.getById(userId)

    if (!user.value) {
      ElMessage.error('客户不存在')
      router.push({ name: 'ClientManagement' })
      return
    }

    // 同时加载用户数据、客户类型和日程数据
    await Promise.all([
      userStore.fetchUsers(), // 确保userStore有用户数据
      customerTypeStorage.getAll().then(types => customerTypes.value = types),
      scheduleStorage.getByUserId(userId).then(schedules => userSchedules.value = schedules)
    ])
  } catch (error) {
    ElMessage.error('加载客户数据失败')
    router.push({ name: 'ClientManagement' })
  } finally {
    loading.value = false
  }
}

// 返回客户管理
const goBack = () => {
  router.push({ name: 'ClientManagement' })
}

// 日程管理方法
const addSchedule = () => {
  currentSchedule.value = new Schedule()
  // 预设客户ID
  currentSchedule.value.userId = user.value.id

  // 设置默认日期时间
  const now = new Date()
  const currentDate = now.toISOString().split('T')[0] // YYYY-MM-DD格式

  // 默认开始时间：今天上午9点
  const startTime = `${currentDate} 09:00`
  // 默认结束时间：今天上午10点
  const endTime = `${currentDate} 10:00`

  currentSchedule.value.startTime = startTime
  currentSchedule.value.endTime = endTime

  scheduleDialogTitle.value = '添加日程'
  isEditMode.value = false
  scheduleDialogVisible.value = true
}

const editSchedule = (schedule) => {
  currentSchedule.value = new Schedule(schedule)
  scheduleDialogTitle.value = '编辑日程'
  isEditMode.value = true
  scheduleDialogVisible.value = true
}

const deleteSchedule = async (schedule) => {
  try {
    await scheduleStorage.delete(schedule.id)
    ElMessage.success('日程删除成功')
    await loadUserData()
  } catch (error) {
    ElMessage.error('删除日程失败')
  }
}

const handleScheduleSave = async (scheduleData) => {
  try {
    if (isEditMode.value) {
      await scheduleStorage.update(scheduleData.id, scheduleData)
      ElMessage.success('日程更新成功')
    } else {
      await scheduleStorage.add(scheduleData)
      ElMessage.success('日程添加成功')
    }

    scheduleDialogVisible.value = false
    await loadUserData()
  } catch (error) {
    ElMessage.error(isEditMode.value ? '更新失败' : '添加失败')
  }
}

const handleScheduleDelete = async (scheduleData) => {
  try {
    await scheduleStorage.delete(scheduleData.id)
    ElMessage.success('日程删除成功')
    scheduleDialogVisible.value = false
    await loadUserData()
  } catch (error) {
    ElMessage.error('删除日程失败')
  }
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

// 获取客户类型标签
const getCustomerTypeLabel = (user) => {
  const customerType = customerTypes.value.find(type => type.id === user.customerType)
  return customerType ? customerType.name : '未分类'
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="client-detail">
    <el-card v-loading="loading" class="client-info-card">
      <template #header>
        <div class="card-header">
          <h2>客户详情</h2>
          <div class="header-actions">
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </div>
      </template>

      <div v-if="user">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>客户名称：</label>
              <span>{{ user.name }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>电话：</label>
              <span>{{ user.phone || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>客户类型：</label>
              <span>{{ getCustomerTypeLabel(user) }}</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item">
              <label>备注：</label>
              <span>{{ user.notes || '无' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>创建时间：</label>
              <span>{{ formatDateTime(user.createdAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>更新时间：</label>
              <span>{{ formatDateTime(user.updatedAt) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card class="schedules-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <h2>关联日程 ({{ userSchedules.length }})</h2>
          <div class="header-actions">
            <el-button type="primary" @click="addSchedule">
              添加日程
            </el-button>
          </div>
        </div>
      </template>

      <el-empty v-if="userSchedules.length === 0" description="暂无关联日程" />

      <el-table
        v-else
        :data="userSchedules"
        style="width: 100%"
        stripe
        :default-sort="{prop: 'startTime', order: 'descending'}"
      >
        <el-table-column prop="title" label="日程标题" min-width="150">
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

        <el-table-column prop="description" label="描述" min-width="150">
          <template #default="scope">
            <span :title="scope.row.description">
              {{ scope.row.description ? (scope.row.description.length > 30 ? scope.row.description.substring(0, 30) + '...' : scope.row.description) : '-' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
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
      :visible="scheduleDialogVisible"
      @update:visible="scheduleDialogVisible = $event"
      :title="scheduleDialogTitle"
      :is-edit-mode="isEditMode"
      :users="userStore.users"
      :model-value="currentSchedule"
      @update:model-value="currentSchedule = $event"
      @save="handleScheduleSave"
      @delete="handleScheduleDelete"
    />
  </div>
</template>

<style scoped>
.client-detail {
  height: 100%;
  overflow-y: auto;
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

.info-item {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.info-item span {
  color: #303133;
}

.schedules-card {
  margin-bottom: 20px;
}
</style>
