<script setup>
import { ref, computed, watch, watchEffect, nextTick, onMounted, onBeforeMount } from 'vue'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, DURATION_TYPE_OPTIONS, EVENT_TYPE_OPTIONS, User, Location } from '../models/types.js'
import { userStorage, locationStorage } from '../services/storage.js'
import { useUserStore } from '../stores/userStore.js'
import {
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElDatePicker,
  ElButton,
  ElRow,
  ElCol,
  ElMessage,
  ElIcon,
  ElRadioGroup,
  ElRadio
} from 'element-plus'
import { ArrowDown, ArrowUp, User as UserIcon } from '@element-plus/icons-vue'

// 组件生命周期调试
onBeforeMount(() => {
  console.log('🎯 ScheduleDialog onBeforeMount')
})

onMounted(() => {
  console.log('🎉 ScheduleDialog onMounted, visible:', props.visible)
})

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '添加日程'
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  users: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: Object,
    default: () => ({
      id: '',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      userId: null,
      location: '',
      location: '',
      priority: 'medium',
      status: 'pending',
      reminder: 0
    })
  },
})

const emit = defineEmits(['update:visible', 'update:modelValue', 'save', 'delete', 'client-created', 'add-client'])

// 使用Pinia store
const userStore = useUserStore()


const formRef = ref(null)

// 表单数据
const formData = ref({
  id: '',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  durationType: 'range',
  eventType: 'court',
  customEventType: '',
  userId: null,
  location: '',
  locationId: null,
  priority: 'medium',
  status: 'pending',
  reminder: 0
})

// 标记是否正在同步数据，避免递归更新
const isSyncing = ref(false)

// 选中的地点ID（用于选择器）
const selectedLocationId = ref('')

// 新建客户相关状态
const clientCreationDialogVisible = ref(false)
const clientFormExpanded = ref(false) // 控制表单是否展开，默认折叠
const newClientForm = ref(new User())
const newClientFormRef = ref(null)

// 新建地点相关状态
const locationCreationDialogVisible = ref(false)
const locationFormExpanded = ref(false) // 控制表单是否展开，默认折叠
const newLocationForm = ref(new Location())
const newLocationFormRef = ref(null)

// 表单验证规则
const formRules = computed(() => {
  const rules = {
    title: [{ required: true, message: '请输入日程标题', trigger: 'blur' }]
  }

  if (formData.value.durationType === 'point') {
    rules.startTime = [{ required: true, message: '请选择时间点', trigger: 'change' }]
  } else if (formData.value.durationType === 'range') {
    rules.startTime = [{ required: true, message: '请选择开始时间', trigger: 'change' }]
    rules.endTime = [{ required: true, message: '请选择结束时间', trigger: 'change' }]
  } else if (formData.value.durationType === 'allday') {
    rules.startTime = [{ required: true, message: '请选择日期', trigger: 'change' }]
  }

  // 自定义事件类型的验证
  if (formData.value.eventType === 'custom') {
    rules.customEventType = [{ required: true, message: '请输入自定义事件类型', trigger: 'blur' }]
  }

  return rules
})

// 新客户表单验证规则
const clientFormRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [{ required: false, message: '请输入电话', trigger: 'blur' }]
}

const locationFormRules = {
  name: [{ required: true, message: '请输入地点名称', trigger: 'blur' }],
  address: [{ required: false, message: '请输入地址', trigger: 'blur' }]
}

// 用户选项 - 使用传入的用户数据
const userOptions = computed(() => {
  const users = props.users || []
  const options = users.map(user => ({
    value: user.id,
    label: user.name
  }))

  // 添加"新建客户"选项
  options.unshift({
    value: '__create_new__',
    label: '+ 新建客户'
  })

  return options
})

// 当前选中客户的名称
const selectedUserName = computed(() => {
  if (!formData.value.userId) return ''
  const user = props.users.find(u => u.id === formData.value.userId)
  return user ? user.name : ''
})

// 地点选项
const locationOptions = ref([])
const locationOptionsComputed = computed(() => {
  const options = locationOptions.value.map(location => ({
    value: location.id,
    label: location.name
  }))

  // 添加"新建地点"选项
  options.unshift({
    value: '__create_new__',
    label: '+ 新建地点'
  })

  // 添加"搜索地点"选项
  options.unshift({
    value: '__manual_input__',
    label: '搜索地点'
  })

  return options
})

// 确保用户数据已加载
const ensureUsersLoaded = async () => {
  if (userStore.users.length === 0) {
    console.log('📊 用户数据为空，重新加载')
    await userStore.fetchUsers()
  }
}

const loadLocations = async () => {
  try {
    locationOptions.value = await locationStorage.getAll()
  } catch (error) {
    console.error('加载地点数据失败:', error)
  }
}

const ensureDataLoaded = async () => {
  await Promise.all([
    ensureUsersLoaded(),
    loadLocations()
  ])
}

// 使用 watchEffect 来监听对话框状态变化
watchEffect(async () => {
  const visible = props.visible

  if (visible) {
    // 确保用户和地点数据已加载
    await ensureDataLoaded()

    // 当对话框打开时，同步表单数据
    isSyncing.value = true
    await nextTick()

    if (props.modelValue) {
      formData.value = { ...props.modelValue }

      // 确保 userId 是字符串类型
      if (formData.value.userId) {
        formData.value.userId = String(formData.value.userId)
      }
    }

    // 根据locationId或location设置selectedLocationId
    if (formData.value.locationId) {
      // 如果有locationId，优先使用ID匹配
      selectedLocationId.value = formData.value.locationId
    } else if (formData.value.location) {
      // 如果只有location名称，尝试匹配现有地点
      const matchedLocation = locationOptions.value.find(loc => loc.name === formData.value.location)
      selectedLocationId.value = matchedLocation ? matchedLocation.id : '__manual_input__'
    } else {
      selectedLocationId.value = ''
    }

    isSyncing.value = false
  } else {
    // 当对话框关闭时，重置表单数据
    isSyncing.value = true
    formData.value = {
      id: '',
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      durationType: 'range',
      eventType: 'court',
      customEventType: '',
      userId: null,
      location: '',
      locationId: null,
      priority: 'medium',
      status: 'pending',
      reminder: 0
    }
    selectedLocationId.value = ''
    isSyncing.value = false
  }
})

// 监听表单数据变化，同步到父组件
watch(() => formData.value, (newValue) => {
  if (props.visible && !isSyncing.value) {
    emit('update:modelValue', { ...newValue })
  }
}, { deep: true })


// 保存日程
const handleSave = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('save', formData.value)
  } catch (error) {
    // 表单验证失败，错误信息已由 Element Plus 处理
  }
}

// 删除日程
const handleDelete = () => {
  emit('delete', formData.value)
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
}

// 处理客户选择变化
const handleClientChange = (value) => {
  console.log('👆 用户选择:', value)

  if (value === '__create_new__') {
    console.log('🆕 用户选择新建客户')
    // 重置选择
    formData.value.userId = null
    console.log('🔄 重置userId为null')

    // 打开新建客户对话框
    openClientCreationDialog()
    console.log('📂 打开新建客户对话框')
  } else {
    console.log('👤 用户选择现有客户:', value)
  }
}

// 处理地点选择变化
const handleLocationChange = (value) => {
  console.log('📍 地点选择:', value)

  if (value === '__create_new__') {
    console.log('🆕 用户选择新建地点')
    // 重置选择
    formData.value.location = ''
    console.log('🔄 重置location为空')

    // 打开新建地点对话框
    openLocationCreationDialog()
    console.log('📂 打开新建地点对话框')
  } else if (value === '__manual_input__') {
    console.log('🔍 用户选择搜索地点')
    // 重置选择，允许手动输入，清空地点ID
    formData.value.location = ''
    formData.value.locationId = null
  } else if (value) {
    // 选择现有地点
    const selectedLocation = locationOptions.value.find(loc => loc.id === value)
    if (selectedLocation) {
      formData.value.location = selectedLocation.name
      formData.value.locationId = selectedLocation.id
      console.log('📍 选择现有地点:', selectedLocation.name, 'ID:', selectedLocation.id)
    }
  }
}


// 打开新建客户对话框
const openClientCreationDialog = () => {
  newClientForm.value = new User()
  clientFormExpanded.value = false // 默认折叠状态
  clientCreationDialogVisible.value = true
}

// 关闭新建客户对话框
const closeClientCreationDialog = () => {
  clientCreationDialogVisible.value = false
  newClientForm.value = new User()
}

// 保存新客户
const saveNewClient = async () => {
  try {
    if (!newClientFormRef.value) return

    await newClientFormRef.value.validate()

    // 通过store直接添加用户
    const newClient = await userStore.addUser(newClientForm.value)
    console.log('✅ 新客户创建成功:', newClient)
    ElMessage.success('客户创建成功')

    // 关闭对话框
    closeClientCreationDialog()
    console.log('🔒 对话框已关闭')

    // 设置选中值（store更新后，userOptions会自动重新计算）
    console.log('🎯 设置选中值:', newClient.id)
    formData.value.userId = newClient.id
    console.log('✅ 选中值设置完成')

  } catch (error) {
    if (error !== 'validation_failed') {
      console.error('❌ 创建客户失败:', error)
      ElMessage.error('创建客户失败')
    }
  }
}

// 打开新建地点对话框
const openLocationCreationDialog = () => {
  newLocationForm.value = new Location()
  locationFormExpanded.value = false // 默认折叠状态
  locationCreationDialogVisible.value = true
}

// 关闭新建地点对话框
const closeLocationCreationDialog = () => {
  locationCreationDialogVisible.value = false
  newLocationForm.value = new Location()
}

// 保存新地点
const saveNewLocation = async () => {
  try {
    if (!newLocationFormRef.value) return

    await newLocationFormRef.value.validate()

    // 添加新地点
    const newLocation = await locationStorage.add(newLocationForm.value)
    console.log('✅ 新地点创建成功:', newLocation)
    ElMessage.success('地点创建成功')

    // 重新加载地点数据
    await loadLocations()

    // 关闭对话框
    closeLocationCreationDialog()
    console.log('🔒 对话框已关闭')

    // 设置选中值 - 同时设置下拉选择器和表单数据
    console.log('🎯 设置选中值:', newLocation.id)
    selectedLocationId.value = newLocation.id
    formData.value.location = newLocation.name
    formData.value.locationId = newLocation.id
    console.log('✅ 选中值设置完成')

  } catch (error) {
    if (error !== 'validation_failed') {
      console.error('❌ 创建地点失败:', error)
      ElMessage.error('创建地点失败')
    }
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
    >
      <!-- 客户提示信息 -->
      <div v-if="selectedUserName" class="client-info-banner">
        <el-icon><UserIcon /></el-icon>
        <span>将为客户 <strong>{{ selectedUserName }}</strong> 添加日程</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="formData.title"
              placeholder="请输入日程标题"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入日程描述"
            />
          </el-form-item>
        </el-col>

        <el-col :span="24">
          <el-form-item label="时间类型">
            <el-radio-group v-model="formData.durationType">
              <el-radio
                v-for="option in DURATION_TYPE_OPTIONS"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="事件类型">
            <el-select v-model="formData.eventType" placeholder="选择事件类型">
              <el-option
                v-for="option in EVENT_TYPE_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <div style="display: flex; align-items: center;">
                  <div
                    :style="{ backgroundColor: option.color, width: '12px', height: '12px', borderRadius: '50%', marginRight: '8px' }"
                  ></div>
                  {{ option.label }}
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 自定义事件类型输入框 -->
        <el-col v-if="formData.eventType === 'custom'" :span="12">
          <el-form-item label="自定义类型" prop="customEventType">
            <el-input
              v-model="formData.customEventType"
              placeholder="请输入自定义事件类型"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-col>

        <!-- 时间点类型 -->
        <el-col v-if="formData.durationType === 'point'" :span="24">
          <el-form-item label="时间点" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="datetime"
              placeholder="选择具体时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            />
          </el-form-item>
        </el-col>

        <!-- 时间段类型 -->
        <template v-else-if="formData.durationType === 'range'">
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker
                v-model="formData.startTime"
                type="datetime"
                placeholder="选择开始时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker
                v-model="formData.endTime"
                type="datetime"
                placeholder="选择结束时间"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
              />
            </el-form-item>
          </el-col>
        </template>

        <!-- 全天类型 -->
        <el-col v-else-if="formData.durationType === 'allday'" :span="24">
          <el-form-item label="日期" prop="startTime">
            <el-date-picker
              v-model="formData.startTime"
              type="date"
              placeholder="选择日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="地点">
            <el-select
              v-model="selectedLocationId"
              placeholder="选择地点"
              clearable
              filterable
              @change="handleLocationChange"
            >
              <el-option
                v-for="location in locationOptionsComputed"
                :key="location.value"
                :label="location.label"
                :value="location.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="优先级">
            <el-select v-model="formData.priority" placeholder="选择优先级">
              <el-option
                v-for="option in PRIORITY_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="状态">
            <el-select v-model="formData.status" placeholder="选择状态">
              <el-option
                v-for="option in STATUS_OPTIONS"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="关联客户">
            <el-select
              v-model="formData.userId"
              placeholder="选择关联客户"
              clearable
              filterable
              @change="handleClientChange"
            >
              <el-option
                v-for="user in userOptions"
                :key="user.value"
                :label="user.label"
                :value="user.value"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <el-col :span="8">
          <el-form-item label="提醒">
            <el-select v-model="formData.reminder" placeholder="选择提醒时间">
              <el-option label="不提醒" :value="0" />
              <el-option label="5分钟前" :value="5" />
              <el-option label="15分钟前" :value="15" />
              <el-option label="30分钟前" :value="30" />
              <el-option label="1小时前" :value="60" />
              <el-option label="1天前" :value="1440" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button v-if="isEditMode" type="danger" @click="handleDelete">删除</el-button>
        <el-button type="primary" @click="handleSave">
          {{ isEditMode ? '更新' : '保存' }}
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 新建客户对话框 -->
  <el-dialog
    v-model="clientCreationDialogVisible"
    title="新建客户"
    width="500px"
    :before-close="closeClientCreationDialog"
  >
    <!-- 客户表单 -->
    <el-form
      ref="newClientFormRef"
      :model="newClientForm"
      :rules="clientFormRules"
      label-width="80px"
    >
      <el-form-item label="客户名称" prop="name">
        <el-input
          v-model="newClientForm.name"
          placeholder="请输入客户名称"
        />
      </el-form-item>

      <!-- 展开/折叠按钮 -->
      <div class="expand-toggle" @click="clientFormExpanded = !clientFormExpanded">
        <span class="expand-text">
          {{ clientFormExpanded ? '收起' : '展开更多信息' }}
        </span>
        <el-icon class="expand-icon">
          <component :is="clientFormExpanded ? ArrowUp : ArrowDown" />
        </el-icon>
      </div>

      <!-- 展开的字段 -->
      <div v-show="clientFormExpanded" class="expanded-fields">
        <el-form-item label="电话">
          <el-input
            v-model="newClientForm.phone"
            placeholder="请输入联系电话"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="newClientForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（如职业、关系等）"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeClientCreationDialog">取消</el-button>
        <el-button type="primary" @click="saveNewClient">
          创建客户
        </el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 新建地点对话框 -->
  <el-dialog
    v-model="locationCreationDialogVisible"
    title="新建地点"
    width="500px"
    :before-close="closeLocationCreationDialog"
  >
    <!-- 地点表单 -->
    <el-form
      ref="newLocationFormRef"
      :model="newLocationForm"
      :rules="locationFormRules"
      label-width="80px"
    >
      <el-form-item label="地点名称" prop="name">
        <el-input
          v-model="newLocationForm.name"
          placeholder="请输入地点名称"
        />
      </el-form-item>

      <!-- 展开/折叠按钮 -->
      <div class="expand-toggle" @click="locationFormExpanded = !locationFormExpanded">
        <span class="expand-text">
          {{ locationFormExpanded ? '收起' : '展开更多信息' }}
        </span>
        <el-icon class="expand-icon">
          <component :is="locationFormExpanded ? ArrowUp : ArrowDown" />
        </el-icon>
      </div>

      <!-- 展开的字段 -->
      <div v-show="locationFormExpanded" class="expanded-fields">
        <el-form-item label="地址">
          <el-input
            v-model="newLocationForm.address"
            placeholder="请输入详细地址"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="newLocationForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（如交通方式、停车信息等）"
          />
        </el-form-item>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeLocationCreationDialog">取消</el-button>
        <el-button type="primary" @click="saveNewLocation">
          创建地点
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.expand-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
  margin: 12px 0;
  transition: color 0.2s ease;
}

.expand-toggle:hover {
  color: #409eff;
}

.expand-text {
  margin-right: 8px;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.client-info-banner {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 16px;
  background-color: #f0f9ff;
  border: 1px solid #b3e5fc;
  border-radius: 6px;
  color: #1976d2;
  font-size: 14px;
}

.client-info-banner .el-icon {
  margin-right: 8px;
  font-size: 16px;
}

.client-info-banner strong {
  color: #0d47a1;
}


.expanded-fields {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
