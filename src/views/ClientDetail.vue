<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userStorage, scheduleStorage } from '../services/storage.js'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../models/types.js'
import {
  ElCard,
  ElRow,
  ElCol,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTag,
  ElEmpty,
  ElMessage
} from 'element-plus'

const route = useRoute()
const router = useRouter()

const user = ref(null)
const userSchedules = ref([])
const loading = ref(true)

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

    userSchedules.value = await scheduleStorage.getByUserId(userId)
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

// 编辑客户
const editUser = () => {
  router.push({
    name: 'ClientManagement',
    query: { edit: user.value.id }
  })
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
            <el-button @click="editUser">编辑客户</el-button>
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </div>
      </template>

      <div v-if="user">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="info-item">
              <label>姓名：</label>
              <span>{{ user.name }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <label>电话：</label>
              <span>{{ user.phone }}</span>
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
      </el-table>
    </el-card>
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
