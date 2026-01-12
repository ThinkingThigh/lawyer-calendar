<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { userStorage, customerTypeStorage } from '../services/storage.js'
import { User, CustomerType } from '../models/types.js'
import {
  ElCard,
  ElButton,
  ElTable,
  ElTableColumn,
  ElInput,
  ElInputNumber,
  ElDialog,
  ElForm,
  ElFormItem,
  ElText,
  ElMessage,
  ElPopconfirm,
  ElTag,
  ElColorPicker
} from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const users = ref([])
const customerTypes = ref([])
const searchQuery = ref('') // 客户搜索
const customerTypeSearchQuery = ref('') // 客户类型搜索
const customerTypeFilter = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('添加客户')
const isEditMode = ref(false)
const showCustomerTypes = ref(false) // 是否显示客户类型管理

// 表单数据
const userForm = ref(new User())
const userFormRef = ref(null)

// 客户类型表单数据
const customerTypeForm = ref(new CustomerType())
const customerTypeFormRef = ref(null)
const customerTypeDialogVisible = ref(false)
const customerTypeDialogTitle = ref('添加客户类型')
const isCustomerTypeEditMode = ref(false)

const formRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  phone: [{ required: false, message: '请输入电话', trigger: 'blur' }]
}

const customerTypeFormRules = {
  name: [{ required: true, message: '请输入客户类型名称', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色', trigger: 'change' }]
}

// 客户类型选项
const customerTypeOptions = computed(() => {
  return customerTypes.value.map(type => ({
    value: type.id,
    label: type.name,
    color: type.color
  }))
})

// 过滤后的客户类型列表（用于客户类型管理）
const filteredCustomerTypes = computed(() => {
  if (!customerTypeSearchQuery.value) return customerTypes.value

  const query = customerTypeSearchQuery.value.toLowerCase()
  return customerTypes.value.filter(type =>
    type.name.toLowerCase().includes(query) ||
    type.description.toLowerCase().includes(query)
  )
})

// 过滤后的客户列表
const filteredUsers = computed(() => {
  let filtered = users.value

  // 按客户类型筛选
  if (customerTypeFilter.value) {
    filtered = filtered.filter(user => user.customerType === customerTypeFilter.value)
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

// 加载客户类型数据
const loadCustomerTypes = async () => {
  try {
    customerTypes.value = await customerTypeStorage.getAll()
  } catch (error) {
    ElMessage.error('加载客户类型数据失败')
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

// 客户类型管理方法
const addCustomerType = () => {
  resetCustomerTypeForm()
  customerTypeDialogTitle.value = '添加客户类型'
  isCustomerTypeEditMode.value = false
  customerTypeDialogVisible.value = true
}

const editCustomerType = (customerType) => {
  customerTypeForm.value = new CustomerType(customerType)
  customerTypeDialogTitle.value = '编辑客户类型'
  isCustomerTypeEditMode.value = true
  customerTypeDialogVisible.value = true
}

const deleteCustomerType = async (customerType) => {
  try {
    await customerTypeStorage.delete(customerType.id)
    ElMessage.success('客户类型删除成功')
    await loadCustomerTypes()
  } catch (error) {
    ElMessage.error(error.message || '删除客户类型失败')
  }
}

const saveCustomerType = async () => {
  try {
    if (!customerTypeFormRef.value) return

    await customerTypeFormRef.value.validate()

    if (isCustomerTypeEditMode.value) {
      await customerTypeStorage.update(customerTypeForm.value.id, customerTypeForm.value)
      ElMessage.success('客户类型更新成功')
    } else {
      await customerTypeStorage.add(customerTypeForm.value)
      ElMessage.success('客户类型添加成功')
    }

    customerTypeDialogVisible.value = false
    await loadCustomerTypes()
  } catch (error) {
    if (error !== 'validation_failed') {
      ElMessage.error(isCustomerTypeEditMode.value ? '更新失败' : '添加失败')
    }
  }
}

const resetCustomerTypeForm = () => {
  customerTypeForm.value = new CustomerType()
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
  const customerType = customerTypes.value.find(type => type.id === user.customerType)
  return customerType ? customerType.name : '未分类'
}

// 客户类型管理辅助方法
const formatCustomerTypeDescription = (description) => {
  if (!description) return '-'
  return description.length > 30 ? description.substring(0, 30) + '...' : description
}

const formatCustomerTypeDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadUsers()
  loadCustomerTypes()
})
</script>

<template>
  <div class="client-management">
    <el-card class="client-card">
      <template #header>
        <div class="card-header">
          <div class="header-title-section">
            <el-button
              v-if="showCustomerTypes"
              type="text"
              @click="showCustomerTypes = false"
              class="back-button"
            >
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <h2>{{ showCustomerTypes ? '客户类型管理' : '客户管理' }}</h2>
          </div>
          <div class="header-actions">
            <el-button v-if="!showCustomerTypes" @click="showCustomerTypes = true">
              客户类型管理
            </el-button>
            <el-button v-if="!showCustomerTypes" type="primary" @click="addUser">
              添加客户
            </el-button>
            <el-button v-if="showCustomerTypes" type="primary" @click="addCustomerType">
              添加客户类型
            </el-button>
          </div>
        </div>
      </template>

      <template v-if="!showCustomerTypes">
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
              v-for="option in customerTypeOptions"
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
      </template>

      <template v-else>
        <div class="customer-type-management">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
              v-model="customerTypeSearchQuery"
              placeholder="搜索客户类型名称或描述"
              clearable
              style="width: 300px"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 客户类型列表 -->
          <el-table
            :data="filteredCustomerTypes"
            style="width: 100%"
            stripe
            :default-sort="{prop: 'sortOrder', order: 'ascending'}"
          >
            <el-table-column prop="name" label="客户类型名称" width="200" sortable>
              <template #default="scope">
                <el-tag :color="scope.row.color" style="color: white;">
                  {{ scope.row.name }}
                </el-tag>
                <el-tag v-if="scope.row.isDefault" size="small" type="info" style="margin-left: 8px;">
                  默认
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="description" label="描述">
              <template #default="scope">
                <span :title="scope.row.description">{{ formatCustomerTypeDescription(scope.row.description) }}</span>
              </template>
            </el-table-column>

            <el-table-column prop="color" label="颜色" width="100">
              <template #default="scope">
                <div class="color-display" :style="{ backgroundColor: scope.row.color }"></div>
              </template>
            </el-table-column>

            <el-table-column prop="sortOrder" label="排序" width="80" sortable>
              <template #default="scope">
                {{ scope.row.sortOrder }}
              </template>
            </el-table-column>

            <el-table-column prop="updatedAt" label="更新时间" width="120" sortable>
              <template #default="scope">
                {{ formatCustomerTypeDate(scope.row.updatedAt) }}
              </template>
            </el-table-column>

            <el-table-column label="操作" width="150" fixed="right">
              <template #default="scope">
                <el-button
                  size="small"
                  @click="editCustomerType(scope.row)"
                >
                  编辑
                </el-button>
                <el-popconfirm
                  v-if="!scope.row.isDefault"
                  title="确定删除这个客户类型吗？"
                  @confirm="deleteCustomerType(scope.row)"
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
        </div>
      </template>
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
              v-for="option in customerTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
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

    <!-- 客户类型表单对话框 -->
    <el-dialog
      v-model="customerTypeDialogVisible"
      :title="customerTypeDialogTitle"
      width="600px"
      :before-close="() => customerTypeDialogVisible = false"
    >
      <el-form
        ref="customerTypeFormRef"
        :model="customerTypeForm"
        :rules="customerTypeFormRules"
        label-width="100px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input
            v-model="customerTypeForm.name"
            placeholder="请输入客户类型名称"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="customerTypeForm.description"
            type="textarea"
            :rows="2"
            placeholder="请输入类型描述（可选）"
          />
        </el-form-item>

        <el-form-item label="颜色" prop="color">
          <el-color-picker
            v-model="customerTypeForm.color"
            show-alpha
            :predefine="['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number
            v-model="customerTypeForm.sortOrder"
            :min="0"
            :max="999"
            controls-position="right"
            placeholder="请输入排序数字"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="customerTypeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCustomerType">
            {{ isCustomerTypeEditMode ? '更新' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Search, ArrowLeft } from '@element-plus/icons-vue'
export default {
  components: {
    Search,
    ArrowLeft
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

.header-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title-section h2 {
  margin: 0;
  color: #303133;
}

.back-button {
  color: #606266;
  font-size: 14px;
  padding: 8px 12px;
}

.back-button:hover {
  color: #409eff;
}

.search-bar {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.customer-type-management {
  width: 100%;
}

.color-display {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
}
</style>
