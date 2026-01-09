<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userStorage } from '../services/storage.js'
import { User, CUSTOMER_TYPE_OPTIONS } from '../models/types.js'
import {
  ElCard,
  ElButton,
  ElTable,
  ElTableColumn,
  ElInput,
  ElDialog,
  ElForm,
  ElFormItem,
  ElText,
  ElMessage,
  ElPopconfirm,
  ElTag
} from 'element-plus'

const router = useRouter()
const users = ref([])
const searchQuery = ref('')
const customerTypeFilter = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('添加客户')
const isEditMode = ref(false)

// 表单数据
const userForm = ref(new User())
const userFormRef = ref(null)

const formRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [{ required: false, message: '请输入电话', trigger: 'blur' }]
}

// 过滤后的客户列表
const filteredUsers = computed(() => {
  let filtered = users.value

  // 按客户类型筛选
  if (customerTypeFilter.value) {
    filtered = filtered.filter(user => {
      if (customerTypeFilter.value === 'custom') {
        return user.customerType === 'custom' && user.customCustomerType
      }
      return user.customerType === customerTypeFilter.value
    })
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.phone.toLowerCase().includes(query) ||
      (user.notes && user.notes.toLowerCase().includes(query))
    )
  }

  return filtered
})

// 加载客户数据
const loadUsers = async () => {
  try {
    users.value = await userStorage.getAll()
  } catch (error) {
    ElMessage.error('加载客户数据失败')
  }
}

// 添加客户
const addUser = () => {
  resetForm()
  dialogTitle.value = '添加客户'
  isEditMode.value = false
  dialogVisible.value = true
}

// 编辑客户
const editUser = (user) => {
  userForm.value = new User(user)
  dialogTitle.value = '编辑客户'
  isEditMode.value = true
  dialogVisible.value = true
}

// 查看客户详情
const viewUser = (user) => {
  router.push({ name: 'ClientDetail', params: { id: user.id } })
}

// 删除客户
const deleteUser = async (user) => {
  try {
    await userStorage.delete(user.id)
    ElMessage.success('客户删除成功')
    await loadUsers()
  } catch (error) {
    ElMessage.error('删除客户失败')
  }
}

// 保存客户
const saveUser = async () => {
  try {
    if (!userFormRef.value) return

    await userFormRef.value.validate()

    if (isEditMode.value) {
      await userStorage.update(userForm.value.id, userForm.value)
      ElMessage.success('客户更新成功')
    } else {
      await userStorage.add(userForm.value)
      ElMessage.success('客户添加成功')
    }

    dialogVisible.value = false
    await loadUsers()
  } catch (error) {
    if (error !== 'validation_failed') {
      ElMessage.error(isEditMode.value ? '更新失败' : '添加失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  userForm.value = new User()
}

// 格式化备注显示
const formatNotes = (notes) => {
  if (!notes) return '-'
  return notes.length > 20 ? notes.substring(0, 20) + '...' : notes
}

// 格式化创建时间
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 获取客户类型标签
const getCustomerTypeLabel = (user) => {
  if (user.customerType === 'custom') {
    return user.customCustomerType || '自定义'
  }
  return user.customerType || '常法'
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="client-management">
    <el-card class="client-card">
      <template #header>
        <div class="card-header">
          <h2>客户管理</h2>
          <el-button type="primary" @click="addUser">
            添加客户
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索客户名称、电话或备注"
          clearable
          style="width: 300px; margin-right: 20px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="customerTypeFilter"
          placeholder="筛选客户类型"
          clearable
          style="width: 150px"
        >
          <el-option
            v-for="option in CUSTOMER_TYPE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>

      <!-- 客户列表 -->
      <el-table
        :data="filteredUsers"
        style="width: 100%"
        stripe
        :default-sort="{prop: 'updatedAt', order: 'descending'}"
      >
        <el-table-column prop="name" label="客户名称" width="150" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="电话" width="150">
          <template #default="scope">
            {{ scope.row.phone }}
          </template>
        </el-table-column>

        <el-table-column prop="customerType" label="客户类型" width="120">
          <template #default="scope">
            <el-tag size="small">{{ getCustomerTypeLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="notes" label="备注">
          <template #default="scope">
            <span :title="scope.row.notes">{{ formatNotes(scope.row.notes) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="120" sortable>
          <template #default="scope">
            {{ formatDate(scope.row.updatedAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="viewUser(scope.row)"
            >
              查看
            </el-button>
            <el-button
              size="small"
              @click="editUser(scope.row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除这个客户吗？"
              @confirm="deleteUser(scope.row)"
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

    <!-- 客户表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      :before-close="() => dialogVisible = false"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="客户名称" prop="name">
          <el-input
            v-model="userForm.name"
            placeholder="请输入客户名称"
          />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input
            v-model="userForm.phone"
            placeholder="请输入联系电话"
          />
        </el-form-item>

        <el-form-item label="客户类型">
          <el-select
            v-model="userForm.customerType"
            placeholder="选择客户类型"
          >
            <el-option
              v-for="option in CUSTOMER_TYPE_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="userForm.customerType === 'custom'" label="自定义类型">
          <el-input
            v-model="userForm.customCustomerType"
            placeholder="请输入自定义客户类型"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="userForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（如职业、关系等）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">
            {{ isEditMode ? '更新' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
export default {
  components: {
    Search
  }
}
</script>

<style scoped>
.client-management {
  height: 100%;
  overflow: auto;
}

.client-card {
  min-height: 100%;
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

.search-bar {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
