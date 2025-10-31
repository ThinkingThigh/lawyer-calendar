<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMenu, ElMenuItem, ElIcon, ElContainer, ElHeader, ElMain } from 'element-plus'
import {
  Calendar,
  User,
  DocumentAdd,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeIndex = ref(route.name)

const handleSelect = (key) => {
  router.push({ name: key })
}

const menuItems = [
  { key: 'Calendar', label: '日历', icon: Calendar },
  { key: 'UserManagement', label: '用户管理', icon: User },
  { key: 'ScheduleManagement', label: '日程管理', icon: DocumentAdd },
  { key: 'Settings', label: '设置', icon: Setting }
]
</script>

<template>
  <el-container class="app-container">
    <el-header class="app-header">
      <div class="header-content">
        <h1 class="app-title">律日历</h1>
        <el-menu
          :default-active="activeIndex"
          class="nav-menu"
          mode="horizontal"
          @select="handleSelect"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.key"
            :index="item.key"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-header>

    <el-main class="app-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
}

.app-header {
  background-color: #409eff;
  color: white;
  padding: 0;
  border-bottom: 1px solid #e4e7ed;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.app-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
}

.nav-menu {
  background-color: transparent;
  border-bottom: none;
}

.nav-menu .el-menu-item {
  color: white;
  border-bottom: none;
}

.nav-menu .el-menu-item:hover,
.nav-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white !important;
  border-bottom: none;
}

.nav-menu .el-menu-item .el-icon {
  margin-right: 8px;
}

.app-main {
  padding: 20px;
  background-color: #f5f5f5;
  overflow-y: auto;
}
</style>
