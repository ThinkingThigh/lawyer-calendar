// 用户数据模型
export class User {
  constructor(data = {}) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.phone = data.phone || ''
    this.notes = data.notes || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }
}

// 地点数据模型
export class Location {
  constructor(data = {}) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.address = data.address || ''
    this.notes = data.notes || ''
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }
}

// 日程数据模型
export class Schedule {
  constructor(data = {}) {
    this.id = data.id || ''
    this.title = data.title || ''
    this.description = data.description || ''
    this.startTime = data.startTime || ''
    this.endTime = data.endTime || ''
    this.durationType = data.durationType || 'range' // point/range/allday
    this.eventType = data.eventType || 'court' // 事件类型：预定义类型或custom
    this.customEventType = data.customEventType || '' // 自定义事件类型名称
    this.userId = data.userId || null
    this.location = data.location || ''
    this.priority = data.priority || 'medium' // low/medium/high
    this.status = data.status || 'pending' // pending/in-progress/completed
    this.reminder = data.reminder || 0 // 分钟数
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }
}

// 系统设置数据模型
export class Settings {
  constructor(data = {}) {
    this.calendarView = data.calendarView || 'dayGridMonth'
    this.theme = data.theme || 'light'
    this.exportPath = data.exportPath || ''
  }
}

// 优先级选项
export const PRIORITY_OPTIONS = [
  { value: 'low', label: '普通', color: '#FFFFFF' },
  { value: 'medium', label: '重要', color: '#FFFFFF' },
  { value: 'high', label: '紧急', color: '#FFFFFF' }
]

// 状态选项
export const STATUS_OPTIONS = [
  { value: 'pending', label: '待办', color: '#FFFFFF' },
  { value: 'in-progress', label: '进行中', color: '#409EFF' },
  { value: 'completed', label: '已完成', color: '#FFFFFF' }
]

// 日历视图选项
export const CALENDAR_VIEWS = [
  { value: 'dayGridMonth', label: '月视图' },
  { value: 'timeGridWeek', label: '周视图' },
  { value: 'timeGridDay', label: '日视图' },
  { value: 'listWeek', label: '列表视图' }
]

// 主题选项
export const THEME_OPTIONS = [
  { value: 'light', label: '浅色主题' },
  { value: 'dark', label: '深色主题' }
]

// 时间类型选项
export const DURATION_TYPE_OPTIONS = [
  { value: 'point', label: '时间点' },
  { value: 'range', label: '时间段' },
  { value: 'allday', label: '全天' }
]

// 事件类型选项
export const EVENT_TYPE_OPTIONS = [
  { value: 'court', label: '开庭', color: '#DC143C' }, // 深红色
  { value: 'meeting', label: '会议', color: '#4169E1' }, // 皇家蓝
  { value: 'training', label: '培训', color: '#32CD32' }, // 绿色
  { value: 'consultation', label: '接谈', color: '#FF6347' }, // 番茄红
  { value: 'document', label: '代书', color: '#9370DB' }, // 中紫色
  { value: 'visit', label: '会见', color: '#FFA500' }, // 橙色
  { value: 'custom', label: '自定义', color: '#708090' } // 深灰色
]
