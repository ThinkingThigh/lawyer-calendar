<script setup>
import { ref, computed, watch } from 'vue'
import { userStorage } from '../services/storage.js'
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../models/types.js'
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
  ElCol
} from 'element-plus'

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
      priority: 'medium',
      status: 'pending',
      reminder: 0
    })
  }
})

const emit = defineEmits(['update:visible', 'update:modelValue', 'save', 'delete'])

const formRef = ref(null)
const users = ref([])

// 表单数据
const formData = ref({ ...props.modelValue })

const formRules = {
  title: [{ required: true, message: '请输入日程标题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

// 用户选项
const userOptions = computed(() => {
  return users.value.map(user => ({
    value: user.id,
    label: user.name
  }))
})

// 监听外部数据变化
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue }
}, { deep: true })

watch(() => props.visible, async (visible) => {
  if (visible) {
    await loadUsers()
  }
})

// 加载用户数据
const loadUsers = async () => {
  try {
    users.value = await userStorage.getAll()
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

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
              value-format="YYYY-MM-DDTHH:mm"
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
              value-format="YYYY-MM-DDTHH:mm"
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
          <el-form-item label="关联用户">
            <el-select
              v-model="formData.userId"
              placeholder="选择关联用户"
              clearable
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
</template>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
