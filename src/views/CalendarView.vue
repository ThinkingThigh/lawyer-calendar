<script setup>
import { ref, onMounted, computed } from 'vue'
import { scheduleStorage, settingsStorage } from '../services/storage.js'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../models/types.js'
import ScheduleDialog from '../components/ScheduleDialog.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import zhCn from '@fullcalendar/core/locales/zh-cn'
import {
  ElButton,
  ElMessage,
  ElCard,
  ElTag
} from 'element-plus'

const calendarRef = ref(null)
const currentView = ref('dayGridMonth')
const schedules = ref([])

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加日程')
const isEditMode = ref(false)

// 表单数据
const scheduleForm = ref({
  id: '',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  userId: null,
  location: '',
  priority: 'medium',
  status: 'pending',
  reminder: 0
})

// 加载数据
const loadData = async () => {
  try {
    const [scheduleData, settings] = await Promise.all([
      scheduleStorage.getAll(),
      settingsStorage.get()
    ])
    schedules.value = scheduleData
    currentView.value = settings.calendarView
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 获取日历事件
const calendarEvents = computed(() => {
  return schedules.value.map(schedule => ({
    id: schedule.id,
    title: schedule.title,
    start: schedule.startTime,
    end: schedule.endTime,
    extendedProps: {
      description: schedule.description,
      userId: schedule.userId,
      location: schedule.location,
      priority: schedule.priority,
      status: schedule.status,
      reminder: schedule.reminder
    },
    backgroundColor: getEventColor(schedule.priority, schedule.status),
    borderColor: getEventColor(schedule.priority, schedule.status)
  }))
})

// 根据优先级和状态获取事件颜色
const getEventColor = (priority, status) => {
  const priorityColor = PRIORITY_OPTIONS.find(p => p.value === priority)?.color || '#409EFF'
  const statusColor = STATUS_OPTIONS.find(s => s.value === status)?.color || '#409EFF'
  return priorityColor
}

// 格式化事件显示
const eventContent = (arg) => {
  return {
    html: `
      <div class="event-content">
        <div class="event-title">${arg.event.title}</div>
        ${arg.event.extendedProps.location ? `<div class="event-location">${arg.event.extendedProps.location}</div>` : ''}
      </div>
    `
  }
}

// 处理日期点击
const handleDateClick = (arg) => {
  resetForm()
  scheduleForm.value.startTime = arg.dateStr + 'T09:00'
  scheduleForm.value.endTime = arg.dateStr + 'T10:00'
  dialogTitle.value = '添加日程'
  isEditMode.value = false
  dialogVisible.value = true
}

// 处理事件点击
const handleEventClick = (arg) => {
  const schedule = schedules.value.find(s => s.id === arg.event.id)
  if (schedule) {
    scheduleForm.value = { ...schedule }
    dialogTitle.value = '编辑日程'
    isEditMode.value = true
    dialogVisible.value = true
  }
}

// 重置表单
const resetForm = () => {
  scheduleForm.value = {
    id: '',
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    userId: null,
    location: '',
    priority: 'medium',
    status: 'pending',
    reminder: 0
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

// 处理删除日程
const handleDeleteSchedule = async (scheduleData) => {
  try {
    await scheduleStorage.delete(scheduleData.id)
    ElMessage.success('日程删除成功')
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    ElMessage.error('删除失败')
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

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="calendar-view">
    <el-card class="calendar-card">
      <template #header>
        <div class="card-header">
          <h2>日程日历</h2>
          <el-button type="primary" @click="handleDateClick({ dateStr: new Date().toISOString().split('T')[0] })">
            添加日程
          </el-button>
        </div>
      </template>

      <FullCalendar
        ref="calendarRef"
        :options="{
          plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          },
          initialView: currentView,
          locale: zhCn,
          events: calendarEvents,
          dateClick: handleDateClick,
          eventClick: handleEventClick,
          eventContent: eventContent,
          height: 'calc(100vh - 200px)',
          dayMaxEvents: true,
          moreLinkClick: 'popover'
        }"
      />
    </el-card>

    <!-- 日程对话框组件 -->
    <ScheduleDialog
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      :is-edit-mode="isEditMode"
      :model-value="scheduleForm"
      @save="handleSaveSchedule"
      @delete="handleDeleteSchedule"
    />
  </div>
</template>

<style scoped>
.calendar-view {
  height: 100%;
}

.calendar-card {
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

.event-content {
  font-size: 12px;
  line-height: 1.2;
}

.event-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-location {
  color: #909399;
  font-size: 11px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
