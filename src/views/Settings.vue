<script setup>
import { ref, onMounted } from 'vue'
import { settingsStorage, dataExport } from '../services/storage.js'
import { CALENDAR_VIEWS, THEME_OPTIONS } from '../models/types.js'
import ReminderManager from '../components/ReminderManager.vue'
import {
  ElCard,
  ElForm,
  ElFormItem,
  ElSelect,
  ElOption,
  ElButton,
  ElMessage,
  ElDivider,
  ElAlert
} from 'element-plus'

const settingsForm = ref({
  calendarView: 'dayGridMonth',
  theme: 'light',
  exportPath: ''
})

const settingsFormRef = ref(null)

// 加载设置
const loadSettings = async () => {
  try {
    const settings = await settingsStorage.get()
    settingsForm.value = { ...settings }
  } catch (error) {
    ElMessage.error('加载设置失败')
  }
}

// 保存设置
const saveSettings = async () => {
  try {
    if (!settingsFormRef.value) return

    await settingsFormRef.value.validate()
    await settingsStorage.update(settingsForm.value)
    ElMessage.success('设置保存成功')
  } catch (error) {
    if (error !== 'validation_failed') {
      ElMessage.error('保存设置失败')
    }
  }
}

// 导出数据
const exportData = async () => {
  try {
    const data = await dataExport.exportAll()
    dataExport.downloadJson(data)
    ElMessage.success('数据导出成功')
  } catch (error) {
    ElMessage.error('数据导出失败')
  }
}

// 重置设置
const resetSettings = async () => {
  try {
    settingsForm.value = {
      calendarView: 'dayGridMonth',
      theme: 'light',
      exportPath: ''
    }
    await settingsStorage.update(settingsForm.value)
    ElMessage.success('设置已重置')
  } catch (error) {
    ElMessage.error('重置设置失败')
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="settings">
    <el-card class="settings-card">
      <template #header>
        <h2>系统设置</h2>
      </template>

      <el-alert
        title="数据说明"
        description="所有数据均存储在本地浏览器中，不会上传到服务器，确保您的隐私安全。"
        type="info"
        show-icon
        style="margin-bottom: 20px;"
      />

      <el-form
        ref="settingsFormRef"
        :model="settingsForm"
        label-width="120px"
      >
        <el-form-item label="默认日历视图">
          <el-select v-model="settingsForm.calendarView" placeholder="选择默认视图">
            <el-option
              v-for="view in CALENDAR_VIEWS"
              :key="view.value"
              :label="view.label"
              :value="view.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="主题设置">
          <el-select v-model="settingsForm.theme" placeholder="选择主题">
            <el-option
              v-for="theme in THEME_OPTIONS"
              :key="theme.value"
              :label="theme.label"
              :value="theme.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings">保存设置</el-button>
          <el-button @click="resetSettings">重置为默认</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="data-section">
        <h3>数据管理</h3>
        <p class="description">
          您可以导出所有数据到本地文件，用于备份或迁移到其他设备。
        </p>

        <el-button type="success" @click="exportData">
          导出数据
        </el-button>
      </div>

      <el-divider />

      <!-- 提醒管理 -->
      <ReminderManager />

      <el-divider />

      <div class="about-section">
        <h3>关于</h3>
        <p>律师日程管理系统 v1.0.0</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.settings {
  height: 100%;
}

.settings-card {
  max-width: 600px;
}

.settings-card h2 {
  margin: 0;
  color: #303133;
}

.data-section,
.about-section {
  margin-top: 20px;
}

.data-section h3,
.about-section h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 16px;
}

.description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.about-section p {
  margin: 5px 0;
  color: #606266;
  line-height: 1.5;
}
</style>
