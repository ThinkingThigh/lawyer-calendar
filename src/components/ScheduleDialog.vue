<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { STATUS_OPTIONS, PRIORITY_OPTIONS, User } from '../models/types.js'
import { userStorage } from '../services/storage.js'
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
  ElIcon
} from 'element-plus'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'

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
  userId: null,
  location: '',
  priority: 'medium',
  status: 'pending',
  reminder: 0
})

// 标记是否正在同步数据，避免递归更新
const isSyncing = ref(false)

// 新建客户相关状态
const clientCreationDialogVisible = ref(false)
const clientFormExpanded = ref(false) // 控制表单是否展开，默认折叠
const newClientForm = ref(new User())
const newClientFormRef = ref(null)

const formRules = {
  title: [{ required: true, message: '请输入日程标题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

// 新客户表单验证规则
const clientFormRules = {
  name: [{ required: true, message: '请输入客户姓名', trigger: 'blur' }],
  phone: [{ required: false, message: '请输入电话', trigger: 'blur' }]
}

// 用户选项 - 直接使用store的数据
const userOptions = computed(() => {
  const options = userStore.users.map(user => ({
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

// 确保用户数据已加载
const ensureUsersLoaded = async () => {
  if (userStore.users.length === 0) {
    console.log('📊 用户数据为空，重新加载')
    await userStore.fetchUsers()
  }
}

// 监听对话框显示状态
watch(() => props.visible, async (visible) => {
  if (visible) {
    // 确保用户数据已加载
    await ensureUsersLoaded()

    // 当对话框打开时，同步表单数据
    isSyncing.value = true
    await nextTick()
    formData.value = { ...props.modelValue }

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
      userId: null,
      location: '',
      priority: 'medium',
      status: 'pending',
      reminder: 0
    }
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

        <el-col :span="12">
          <el-form-item label="地点">
            <el-input
              v-model="formData.location"
              placeholder="请输入地点"
            />
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
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="newClientForm.name"
          placeholder="请输入客户姓名"
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
