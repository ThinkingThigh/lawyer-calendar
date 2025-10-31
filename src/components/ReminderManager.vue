<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElButton, ElAlert, ElSwitch } from 'element-plus'
import reminderService from '../services/reminder.js'

const permissionStatus = ref('default')
const isServiceRunning = ref(false)

// 组件挂载时检查权限状态
onMounted(async () => {
  permissionStatus.value = reminderService.getPermissionStatus()
  isServiceRunning.value = reminderService.isRunning
})

// 组件卸载时清理
onUnmounted(() => {
  // 不在这里停止服务，因为可能在其他地方还需要
})

// 请求通知权限
const requestPermission = async () => {
  try {
    const granted = await reminderService.requestPermission()
    permissionStatus.value = reminderService.getPermissionStatus()

    if (granted) {
      ElMessage.success('通知权限已获取，开始启用提醒功能')
      startReminderService()
    } else if (permissionStatus.value === 'denied') {
      ElMessage.warning('通知权限被拒绝，无法启用提醒功能。您可以在浏览器设置中重新启用。')
    } else {
      ElMessage.info('通知权限请求已取消。如需使用提醒功能，请重新请求权限。')
    }
  } catch (error) {
    console.error('权限请求过程中出错:', error)
    ElMessage.error('权限请求失败，请检查浏览器设置或禁用可能干扰的扩展。')
    permissionStatus.value = reminderService.getPermissionStatus()
  }
}

// 启动提醒服务
const startReminderService = () => {
  if (reminderService.permissionGranted) {
    reminderService.init()
    isServiceRunning.value = true
    ElMessage.success('提醒服务已启动')
  } else {
    ElMessage.warning('请先获取通知权限')
  }
}

// 停止提醒服务
const stopReminderService = () => {
  reminderService.stopChecking()
  isServiceRunning.value = false
  ElMessage.info('提醒服务已停止')
}

// 获取权限状态文本
const getPermissionText = (status) => {
  switch (status) {
    case 'granted':
      return '已授权'
    case 'denied':
      return '已拒绝'
    case 'default':
      return '未询问'
    case 'not-supported':
      return '不支持'
    default:
      return '未知'
  }
}

// 获取权限状态类型
const getPermissionType = (status) => {
  switch (status) {
    case 'granted':
      return 'success'
    case 'denied':
      return 'error'
    case 'default':
      return 'warning'
    case 'not-supported':
      return 'info'
    default:
      return 'info'
  }
}

// 测试提醒功能
const testReminder = () => {
  if (!reminderService.permissionGranted) {
    ElMessage.warning('请先获取通知权限')
    return
  }

  try {
    // 创建一个测试日程
    const testSchedule = {
      id: 'test-reminder',
      title: '测试提醒',
      description: '这是一个测试提醒，用于验证提醒功能是否正常工作',
      startTime: new Date(Date.now() + 5000).toISOString(), // 5秒后
      reminder: 0 // 立即提醒
    }

    reminderService.showNotification(testSchedule)
    ElMessage.success('测试提醒已发送，请查看浏览器通知区域')
  } catch (error) {
    console.error('测试提醒失败:', error)
    ElMessage.error('测试提醒失败，请检查浏览器通知设置')
  }
}
</script>

<template>
  <div class="reminder-manager">
    <h3>日程提醒设置</h3>

    <!-- 权限状态 -->
    <el-alert
      :title="`通知权限状态: ${getPermissionText(permissionStatus)}`"
      :type="getPermissionType(permissionStatus)"
      :closable="false"
      class="permission-alert"
    >
      <template #description>
        <div v-if="permissionStatus === 'default'">
          需要获取浏览器通知权限才能启用日程提醒功能
        </div>
        <div v-else-if="permissionStatus === 'denied'">
          通知权限已被拒绝，请在浏览器设置中重新启用
        </div>
        <div v-else-if="permissionStatus === 'not-supported'">
          当前浏览器不支持通知功能
        </div>
        <div v-else>
          通知权限已获取，可以正常使用提醒功能
        </div>
      </template>
    </el-alert>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button
        v-if="permissionStatus === 'default'"
        type="primary"
        @click="requestPermission"
      >
        获取通知权限
      </el-button>

      <el-button
        v-if="permissionStatus === 'granted' && !isServiceRunning"
        type="success"
        @click="startReminderService"
      >
        启动提醒服务
      </el-button>

      <el-button
        v-if="isServiceRunning"
        type="warning"
        @click="stopReminderService"
      >
        停止提醒服务
      </el-button>

      <el-button
        v-if="permissionStatus === 'granted'"
        type="info"
        @click="testReminder"
      >
        测试提醒功能
      </el-button>
    </div>

    <!-- 服务状态 -->
    <div class="service-status">
      <p>
        <strong>服务状态:</strong>
        <el-tag :type="isServiceRunning ? 'success' : 'info'">
          {{ isServiceRunning ? '运行中' : '已停止' }}
        </el-tag>
      </p>
      <p v-if="isServiceRunning">
        <small>系统将每分钟检查一次即将到来的日程，并在设定的提醒时间发送通知</small>
      </p>
    </div>

    <!-- 使用说明 -->
    <div class="usage-guide">
      <h4>使用说明：</h4>
      <ul>
        <li>在添加/编辑日程时，可以设置提醒时间（5分钟前、15分钟前等）</li>
        <li>系统会在设定的时间自动发送浏览器通知</li>
        <li>页面关闭后，提醒服务仍然会在后台运行</li>
        <li>点击通知可以回到应用查看日程详情</li>
        <li>提醒只会在设定的时间范围内触发一次，避免重复提醒</li>
      </ul>

      <h4>提醒时间选项：</h4>
      <ul>
        <li><strong>不提醒：</strong>不会发送任何通知</li>
        <li><strong>5分钟前：</strong>日程开始前5分钟提醒</li>
        <li><strong>15分钟前：</strong>日程开始前15分钟提醒</li>
        <li><strong>30分钟前：</strong>日程开始前30分钟提醒</li>
        <li><strong>1小时前：</strong>日程开始前1小时提醒</li>
        <li><strong>1天前：</strong>日程开始前1天提醒</li>
      </ul>

      <h4>浏览器兼容性：</h4>
      <ul>
        <li>支持Chrome、Firefox、Safari等现代浏览器</li>
        <li>需要用户授权通知权限</li>
        <li>HTTPS环境下功能更稳定</li>
        <li>某些浏览器扩展可能影响通知功能</li>
      </ul>

      <h4>故障排除：</h4>
      <ul>
        <li><strong>权限被拒绝：</strong>在浏览器设置中重新启用通知权限</li>
        <li><strong>扩展冲突：</strong>尝试禁用广告拦截器或其他可能干扰的扩展</li>
        <li><strong>功能异常：</strong>刷新页面或重启浏览器后重试</li>
        <li><strong>不支持：</strong>某些移动浏览器可能不支持完整功能</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.reminder-manager {
  padding: 20px;
}

.permission-alert {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.service-status {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.usage-guide {
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.usage-guide h4 {
  margin: 0 0 10px 0;
  color: #409eff;
}

.usage-guide ul {
  margin: 0;
  padding-left: 20px;
}

.usage-guide li {
  margin-bottom: 5px;
  color: #666;
}
</style>
