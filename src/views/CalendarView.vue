<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { scheduleStorage, settingsStorage, userStorage } from '../services/storage.js'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, Schedule } from '../models/types.js'
import ScheduleDialog from '../components/ScheduleDialog.vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import zhCn from '@fullcalendar/core/locales/zh-cn'
import dayjs from 'dayjs'
import {
  ElButton,
  ElMessage,
  ElCard,
  ElTag
} from 'element-plus'

const calendarRef = ref(null)
const currentView = ref('dayGridMonth')
const schedules = ref([])
const users = ref([])

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('添加日程')
const isEditMode = ref(false)
const dialogKey = ref(0) // 用于强制重新渲染对话框组件

// 表单数据
const scheduleForm = ref(new Schedule())

// 加载数据
const loadData = async () => {
  try {
    const [scheduleData, userData, settings] = await Promise.all([
      scheduleStorage.getAll(),
      userStorage.getAll(),
      settingsStorage.get()
    ])
    schedules.value = scheduleData
    users.value = userData
    currentView.value = settings.calendarView
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}

// 获取日历事件
const calendarEvents = computed(() => {
  return schedules.value.map(schedule => {
    const eventColor = getEventColor(schedule.priority, schedule.status)

    let eventConfig = {
      id: schedule.id,
      title: schedule.title,
      extendedProps: {
        description: schedule.description,
        userId: schedule.userId,
        location: schedule.location,
        priority: schedule.priority,
        status: schedule.status,
        reminder: schedule.reminder,
        durationType: schedule.durationType
      },
      backgroundColor: eventColor,
      borderColor: eventColor,
      textColor: '#ffffff',
      display: getEventDisplay(schedule),
      classNames: [`priority-${schedule.priority}`, `status-${schedule.status}`, `duration-${schedule.durationType}`]
    }

    // 根据时间类型设置不同的时间属性
    if (schedule.durationType === 'allday') {
      // 全天事件
      eventConfig.start = schedule.startTime.split(' ')[0] // 只取日期部分
      eventConfig.allDay = true
    } else if (schedule.durationType === 'point') {
      // 时间点事件 - 设置开始和结束时间相同
      eventConfig.start = schedule.startTime
      eventConfig.end = schedule.startTime // 时间点事件开始和结束时间相同
    } else {
      // 时间段事件（默认）
      eventConfig.start = schedule.startTime
      eventConfig.end = schedule.endTime
    }

    return eventConfig
  })
})

// 根据日程属性决定显示方式
const getEventDisplay = (schedule) => {
  // 全天事件使用block显示
  if (schedule.durationType === 'allday') {
    return 'block'
  }

  // 时间点事件使用特殊的点状显示
  if (schedule.durationType === 'point') {
    return 'block'
  }

  // 时间段事件：持续时间超过8小时的事件使用block显示
  const start = dayjs(schedule.startTime)
  const end = dayjs(schedule.endTime)
  const duration = end.diff(start, 'hour')

  if (duration >= 8) {
    return 'block'
  }

  return 'auto'
}

// 根据优先级和状态获取事件颜色
const getEventColor = (priority, status) => {
  // 优先使用优先级颜色，如果是高优先级则使用对应的颜色
  if (priority === 'high') {
    return '#F56C6C' // 红色
  } else if (priority === 'medium') {
    return '#E6A23C' // 橙色
  } else if (priority === 'low') {
    return '#67C23A' // 绿色
  }

  // 如果没有优先级信息，使用状态颜色
  const statusColor = STATUS_OPTIONS.find(s => s.value === status)?.color
  if (statusColor) {
    return statusColor
  }

  return '#409EFF' // 默认蓝色
}

// 智能截断文本
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength - 1) + '...'
}

// 获取合适的标题长度
const getOptimalTitleLength = (elementWidth) => {
  // 根据元素宽度估算合适的字符数
  const charWidth = 12 // 平均字符宽度
  const availableChars = Math.floor(elementWidth / charWidth) - 5 // 预留一些空间
  return Math.max(availableChars, 8) // 最少8个字符
}

// 格式化事件显示
const eventDidMount = (arg) => {
  const eventEl = arg.el
  const event = arg.event
  const view = arg.view

  // 清空默认内容
  eventEl.innerHTML = ''

  // 创建自定义内容
  const contentDiv = document.createElement('div')
  contentDiv.className = 'event-content'

  // 创建标题容器
  const titleContainer = document.createElement('div')
  titleContainer.className = 'event-title-container'

  // 计算合适的标题长度
  const elementWidth = eventEl.offsetWidth || 120 // 默认宽度
  const optimalLength = getOptimalTitleLength(elementWidth)
  const displayTitle = truncateText(event.title, optimalLength)

  const titleDiv = document.createElement('div')
  titleDiv.className = 'event-title'
  titleDiv.textContent = displayTitle
  titleDiv.title = event.title // 显示完整标题的tooltip
  titleContainer.appendChild(titleDiv)

  // 根据视图类型和时间类型显示不同信息
  if (view.type === 'dayGridMonth') {
    // 月视图：显示标题和时间
    const timeDiv = document.createElement('div')
    timeDiv.className = 'event-time'

    if (event.extendedProps.durationType === 'allday') {
      timeDiv.textContent = '全天'
      timeDiv.className = 'event-time event-allday'
    } else if (event.extendedProps.durationType === 'point') {
      const timePoint = dayjs(event.start).format('HH:mm')
      timeDiv.textContent = timePoint + ' ⚫'
      timeDiv.className = 'event-time event-point'
    } else {
      const startTime = dayjs(event.start).format('HH:mm')
      timeDiv.textContent = startTime
    }
    titleContainer.appendChild(timeDiv)
  } else if (view.type === 'timeGridWeek' || view.type === 'timeGridDay') {
    // 周视图和日视图：显示标题和地点（如果有）
    if (event.extendedProps.durationType === 'point') {
      // 时间点事件显示特殊标识
      const pointIndicator = document.createElement('div')
      pointIndicator.className = 'event-point-indicator'
      pointIndicator.textContent = '⚫'
      contentDiv.appendChild(pointIndicator)
    }

    if (event.extendedProps.location) {
      const locationDiv = document.createElement('div')
      locationDiv.className = 'event-location'
      locationDiv.textContent = truncateText(event.extendedProps.location, 15)
      locationDiv.title = event.extendedProps.location // 显示完整地点的tooltip
      contentDiv.appendChild(locationDiv)
    }
  } else if (view.type === 'listWeek') {
    // 列表视图：显示完整信息
    const detailsDiv = document.createElement('div')
    detailsDiv.className = 'event-details'

    if (event.extendedProps.location) {
      const locationDiv = document.createElement('span')
      locationDiv.className = 'event-location'
      locationDiv.textContent = `地点：${truncateText(event.extendedProps.location, 20)}`
      locationDiv.title = event.extendedProps.location
      detailsDiv.appendChild(locationDiv)
    }

    if (event.extendedProps.description) {
      const descDiv = document.createElement('span')
      descDiv.className = 'event-description'
      descDiv.textContent = event.extendedProps.description.length > 50
        ? event.extendedProps.description.substring(0, 50) + '...'
        : event.extendedProps.description
      descDiv.title = event.extendedProps.description
      detailsDiv.appendChild(descDiv)
    }

    contentDiv.appendChild(detailsDiv)
  }

  contentDiv.appendChild(titleContainer)
  eventEl.appendChild(contentDiv)
}

// 处理日期点击
const handleDateClick = (arg) => {
  resetForm()

  // 使用点击的日期作为默认日期，设置上午9:00开始，持续1小时
  const clickedDate = dayjs(arg.date)
  scheduleForm.value.startTime = clickedDate.hour(9).minute(0).format('YYYY-MM-DD HH:mm')
  scheduleForm.value.endTime = clickedDate.hour(10).minute(0).format('YYYY-MM-DD HH:mm')

  dialogTitle.value = '添加日程'
  isEditMode.value = false
  dialogKey.value++ // 强制重新渲染对话框

  // 使用nextTick确保DOM更新后再设置visible
  nextTick(() => {
    dialogVisible.value = true
  })
}

// 处理事件点击
const handleEventClick = async (arg) => {
  const schedule = schedules.value.find(s => s.id === arg.event.id)
  if (schedule) {
    // 如果对话框已经打开，先关闭它
    if (dialogVisible.value) {
      dialogVisible.value = false
      await nextTick()
    }

    // 重置表单并设置新数据
    resetForm()

    // 直接设置完整的数据对象
    scheduleForm.value = {
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      durationType: schedule.durationType || 'range', // 确保有默认值
      userId: schedule.userId,
      location: schedule.location,
      priority: schedule.priority,
      status: schedule.status,
      reminder: schedule.reminder
    }

    dialogTitle.value = '编辑日程'
    isEditMode.value = true

    // 等待数据更新后再显示对话框
    await nextTick()
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
    durationType: 'range',
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

// 处理事件鼠标悬停
const handleEventMouseEnter = (arg) => {
  const eventEl = arg.el
  eventEl.style.transform = 'scale(1.02)'
  eventEl.style.zIndex = '10'
  eventEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)'
}

// 处理事件鼠标离开
const handleEventMouseLeave = (arg) => {
  const eventEl = arg.el
  eventEl.style.transform = 'scale(1)'
  eventEl.style.zIndex = 'auto'
  eventEl.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
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
          eventDidMount: eventDidMount,
          height: 'calc(100vh - 200px)',
          dayMaxEvents: 6,
          moreLinkClick: 'popover',
          eventDisplay: 'auto',
          eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          },
          views: {
            dayGridMonth: {
              dayMaxEvents: 6,
              moreLinkClick: 'popover',
              eventDisplay: 'block'
            },
            timeGridWeek: {
              nowIndicator: true,
              scrollTime: '08:00:00',
              slotDuration: '00:30:00',
              slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }
            },
            timeGridDay: {
              nowIndicator: true,
              scrollTime: '08:00:00',
              slotDuration: '00:15:00',
              slotLabelFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }
            },
            listWeek: {
              listDayFormat: { weekday: 'long', month: 'long', day: 'numeric' }
            }
          },
          eventMouseEnter: handleEventMouseEnter,
          eventMouseLeave: handleEventMouseLeave
        }"
      />
    </el-card>

    <!-- 日程对话框组件 -->
    <ScheduleDialog
      :key="dialogKey"
      :visible="dialogVisible"
      :model-value="scheduleForm"
      @update:visible="dialogVisible = $event"
      @update:model-value="scheduleForm = $event"
      :title="dialogTitle"
      :is-edit-mode="isEditMode"
      :users="users"
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
  line-height: 1.3;
  width: 100%;
  padding: 2px 4px;
}

.event-title-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}

.event-title {
  font-weight: 500;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 10px;
  color: #606266;
  font-weight: 400;
  flex-shrink: 0;
}

.event-location {
  color: #909399;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.event-point-indicator {
  color: #E6A23C;
  font-size: 12px;
  font-weight: bold;
  margin-right: 4px;
  display: inline-block;
}

.event-allday {
  color: #67C23A !important;
  font-weight: 500;
}

.event-details {
  margin-top: 4px;
  font-size: 11px;
  color: #909399;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-description {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* FullCalendar 事件样式优化 */
:deep(.fc-event) {
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.fc-event:focus) {
  outline: 2px solid #409EFF;
  outline-offset: 2px;
}

:deep(.fc-daygrid-event) {
  margin: 2px 1px;
  padding: 0;
  min-height: 22px;
  border-radius: 4px;
}

:deep(.fc-daygrid-event:hover) {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

/* 月视图事件样式 */
:deep(.fc-daygrid-day-events) {
  margin: 2px 0;
}

:deep(.fc-daygrid-event .fc-event-main) {
  padding: 0;
}

/* 时间网格视图中的事件样式优化 */
:deep(.fc-timegrid-event) {
  border-radius: 3px;
  margin: 1px 2px;
}

:deep(.fc-timegrid-event .event-content) {
  padding: 2px 6px;
}

:deep(.fc-timegrid-event .event-title) {
  font-size: 12px;
  line-height: 1.3;
}

/* 列表视图样式优化 */
:deep(.fc-list-event) {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

:deep(.fc-list-event:hover) {
  background-color: #f8f9fa;
}

:deep(.fc-list-event .event-content) {
  margin-left: 8px;
}

:deep(.fc-list-event .event-details) {
  margin-top: 6px;
  padding-left: 8px;
  border-left: 3px solid #e4e7ed;
  background-color: #fafbfc;
  padding: 4px 8px;
  border-radius: 3px;
}

/* 优先级指示器 */
:deep(.fc-event[data-priority="high"]) {
  border-left: 3px solid #F56C6C;
}

:deep(.fc-event[data-priority="medium"]) {
  border-left: 3px solid #E6A23C;
}

:deep(.fc-event[data-priority="low"]) {
  border-left: 3px solid #67C23A;
}

/* 状态指示器样式 */
:deep(.fc-event[data-status="completed"]) {
  opacity: 0.7;
  text-decoration: line-through;
}

:deep(.fc-event[data-status="cancelled"]) {
  opacity: 0.5;
  background-color: #909399 !important;
}

/* 时间类型指示器样式 */
:deep(.fc-event[data-duration-type="point"]) {
  border-left: 4px solid #E6A23C !important;
}

:deep(.fc-event[data-duration-type="allday"]) {
  border-top: 3px solid #67C23A !important;
  border-radius: 0 !important;
}

/* FullCalendar 弹出框样式优化 */
:deep(.fc-popover) {
  max-height: 400px;
  overflow-y: auto;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.fc-popover-body) {
  max-height: 350px;
  overflow-y: auto;
  padding: 8px;
}

:deep(.fc-popover .fc-event) {
  margin: 2px 0;
  padding: 4px 8px;
}

/* 确保事件列表可滚动 */
:deep(.fc-daygrid-more-popup) {
  max-height: 250px;
  overflow-y: auto;
}

/* 响应式优化 */
@media (max-width: 1200px) {
  /* 平板样式 */
  :deep(.fc-header-toolbar) {
    flex-direction: column;
    gap: 8px;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  /* 手机样式 */
  :deep(.fc-daygrid-event) {
    min-height: 24px;
    margin: 1px 0;
  }

  .event-content {
    font-size: 11px;
    padding: 1px 3px;
  }

  .event-title {
    font-size: 11px;
  }

  .event-time {
    font-size: 9px;
  }

  .event-location {
    font-size: 10px;
  }

  :deep(.fc-timegrid-event .event-title) {
    font-size: 11px;
  }

  :deep(.fc-timegrid-event .event-content) {
    padding: 1px 4px;
  }

  /* 列表视图在小屏幕上的优化 */
  :deep(.fc-list-event) {
    padding: 6px 8px;
  }

  :deep(.fc-list-event .event-content) {
    margin-left: 4px;
  }

  /* 弹出框在小屏幕上的优化 */
  :deep(.fc-popover) {
    max-height: 300px;
    max-width: 280px;
  }

  :deep(.fc-popover-body) {
    max-height: 250px;
    padding: 6px;
  }
}

@media (max-width: 480px) {
  /* 小手机样式 */
  :deep(.fc-daygrid-event) {
    min-height: 20px;
  }

  .event-content {
    font-size: 10px;
    padding: 1px 2px;
  }

  .event-title {
    font-size: 10px;
  }

  .event-time {
    font-size: 8px;
  }

  /* 隐藏次要信息以节省空间 */
  .event-location {
    display: none;
  }

  /* 工具栏优化 */
  :deep(.fc-button) {
    padding: 4px 8px;
    font-size: 12px;
  }

  :deep(.fc-button-group .fc-button) {
    margin: 0;
  }
}
</style>
