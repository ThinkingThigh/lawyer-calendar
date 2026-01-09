<script setup>
import { ref, onMounted, computed } from 'vue'
import { locationStorage } from '../services/storage.js'
import { Location } from '../models/types.js'
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

const locations = ref([])
const searchQuery = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('添加地点')
const isEditMode = ref(false)

// 表单数据
const locationForm = ref(new Location())
const locationFormRef = ref(null)

const formRules = {
  name: [{ required: true, message: '请输入地点名称', trigger: 'blur' }],
  address: [{ required: false, message: '请输入地址', trigger: 'blur' }]
}

// 过滤后的地点列表
const filteredLocations = computed(() => {
  if (!searchQuery.value) return locations.value

  const query = searchQuery.value.toLowerCase()
  return locations.value.filter(location =>
    location.name.toLowerCase().includes(query) ||
    location.address.toLowerCase().includes(query)
  )
})

// 加载地点数据
const loadLocations = async () => {
  try {
    locations.value = await locationStorage.getAll()
  } catch (error) {
    ElMessage.error('加载地点数据失败')
  }
}

// 添加地点
const addLocation = () => {
  resetForm()
  dialogTitle.value = '添加地点'
  isEditMode.value = false
  dialogVisible.value = true
}

// 编辑地点
const editLocation = (location) => {
  locationForm.value = new Location(location)
  dialogTitle.value = '编辑地点'
  isEditMode.value = true
  dialogVisible.value = true
}

// 删除地点
const deleteLocation = async (location) => {
  try {
    await locationStorage.delete(location.id)
    ElMessage.success('地点删除成功')
    await loadLocations()
  } catch (error) {
    ElMessage.error('删除地点失败')
  }
}

// 保存地点
const saveLocation = async () => {
  try {
    if (!locationFormRef.value) return

    await locationFormRef.value.validate()

    if (isEditMode.value) {
      await locationStorage.update(locationForm.value.id, locationForm.value)
      ElMessage.success('地点更新成功')
    } else {
      await locationStorage.add(locationForm.value)
      ElMessage.success('地点添加成功')
    }

    dialogVisible.value = false
    await loadLocations()
  } catch (error) {
    if (error !== 'validation_failed') {
      ElMessage.error(isEditMode.value ? '更新失败' : '添加失败')
    }
  }
}

// 重置表单
const resetForm = () => {
  locationForm.value = new Location()
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

onMounted(() => {
  loadLocations()
})
</script>

<template>
  <div class="location-management">
    <el-card class="location-card">
      <template #header>
        <div class="card-header">
          <h2>地点管理</h2>
          <el-button type="primary" @click="addLocation">
            添加地点
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索地点名称或地址"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- 地点列表 -->
      <el-table
        :data="filteredLocations"
        style="width: 100%"
        stripe
        :default-sort="{prop: 'updatedAt', order: 'descending'}"
      >
        <el-table-column prop="name" label="地点名称" width="200" sortable>
          <template #default="scope">
            <el-tag>{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="地址" min-width="300">
          <template #default="scope">
            <span :title="scope.row.address">{{ scope.row.address || '-' }}</span>
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

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="editLocation(scope.row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定删除这个地点吗？"
              @confirm="deleteLocation(scope.row)"
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

    <!-- 地点表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :before-close="() => dialogVisible = false"
    >
      <el-form
        ref="locationFormRef"
        :model="locationForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="地点名称" prop="name">
          <el-input
            v-model="locationForm.name"
            placeholder="请输入地点名称"
          />
        </el-form-item>

        <el-form-item label="地址" prop="address">
          <el-input
            v-model="locationForm.address"
            placeholder="请输入详细地址"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="locationForm.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（如交通方式、停车信息等）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveLocation">
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
.location-management {
  height: 100%;
  overflow: auto;
}

.location-card {
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