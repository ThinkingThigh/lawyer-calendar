# 律师日程管理系统

一个专为律师事务所设计的网页版日程管理系统，提供直观的日历界面，支持客户管理和日程管理两大核心功能。

## ✨ 功能特性

### 📅 日历管理
- **多种视图**: 支持月视图、周视图、日视图和列表视图
- **智能交互**: 点击空白区域快速添加日程，拖拽调整时间
- **事件展示**: 按优先级和状态显示不同颜色的日程事件
- **双击编辑**: 快速编辑现有日程

### 👥 客户管理
- **客户信息**: 管理客户姓名、电话、备注等信息
- **快速搜索**: 支持按姓名或电话搜索客户
- **关联日程**: 查看客户相关的所有日程安排
- **详情查看**: 详细的客户信息和日程列表

### 📝 日程管理
- **灵活创建**: 支持设置标题、描述、时间、地点等
- **优先级设置**: 普通、重要、紧急三个优先级
- **状态跟踪**: 待办、进行中、已完成状态管理
- **用户关联**: 可关联到特定客户
- **批量操作**: 支持批量删除和状态更新

### 💾 数据管理
- **本地存储**: 所有数据存储在本地浏览器，确保隐私安全
- **数据导出**: 支持导出所有数据为JSON格式
- **自动保存**: 数据操作实时保存，无需手动保存
- **跨设备**: 通过导出/导入实现数据迁移

### 🔔 通知提醒
- **智能提醒**: 支持设置提前提醒时间（15分钟到24小时）
- **系统通知**: 在macOS上使用原生系统通知
- **浏览器兼容**: 在网页版中使用浏览器通知API
- **点击跳转**: 点击通知可聚焦到应用窗口

### 📱 跨平台支持
- **网页版本**: 支持所有现代浏览器
- **macOS应用**: 专为macOS优化的桌面应用程序
- **Electron封装**: 使用Electron框架打包为原生应用
- **系统集成**: 完整的macOS系统集成体验

### 🎨 用户体验
- **响应式设计**: 适配桌面端和移动端
- **直观界面**: 基于Element Plus的现代化UI
- **中文支持**: 完整的中文界面和日历本地化
- **快捷操作**: 丰富的快捷键和操作提示

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0
- npm 或 yarn

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

### 运行Electron版本
```bash
npm run electron
```

### 构建macOS应用程序
```bash
npm run build-mac
```

### 手动启动mac应用程序
```bash
./run-mac-app.sh
```

### 运行Windows版本
```bash
run-win-app.bat
# 或使用PowerShell
run-win-app.ps1
```

### 构建Windows应用程序
```bash
npm run build-win
```

### 验证安装包
```bash
# Windows批处理脚本
verify-installer.bat

# 或使用PowerShell
verify-installer.ps1
```

### 检查Windows系统架构
```bash
# 批处理脚本 (推荐)
check-windows-arch.bat

# 或使用PowerShell
check-windows-arch.ps1
```

## 📖 使用指南

### 首次使用
1. 打开应用，默认进入日历页面
2. 点击"添加客户"添加您的第一个客户
3. 在日历上点击时间或"添加日程"按钮创建日程
4. 日程可以关联到特定客户，便于管理

### 主要操作
- **添加日程**: 在日历空白区域点击，或使用"添加日程"按钮
- **编辑日程**: 双击日历事件或在日程管理页面编辑
- **关联客户**: 在日程创建时选择关联的客户
- **查看详情**: 点击客户名查看客户详情和相关日程
- **数据导出**: 在设置页面导出所有数据

## 🛠️ 技术栈

### 前端技术
- **前端框架**: Vue.js 3
- **构建工具**: Vite
- **UI库**: Element Plus
- **日历组件**: FullCalendar
- **本地存储**: LocalForage
- **路由**: Vue Router 4

### 桌面应用
- **Electron**: 桌面应用框架
- **electron-builder**: 应用打包工具
- **系统通知**: 原生macOS通知API

## 📊 数据结构

### 用户数据
```javascript
{
  id: "unique_id",
  name: "客户姓名",
  phone: "联系电话",
  notes: "备注信息",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### 日程数据
```javascript
{
  id: "unique_id",
  title: "日程标题",
  description: "详细描述",
  startTime: "开始时间",
  endTime: "结束时间",
  userId: "关联用户ID",
  location: "地点",
  priority: "优先级", // low/medium/high
  status: "状态", // pending/in-progress/completed
  reminder: "提醒时间",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

## 🔒 隐私与安全

- 所有数据存储在用户本地浏览器中
- 不涉及任何服务器端数据传输
- 数据仅在用户设备本地处理
- 支持数据导出，便于备份和迁移

## 🍎 macOS应用程序使用指南

### 安装说明
1. 确保已安装Node.js和npm
2. 克隆或下载项目代码
3. 安装依赖：`npm install`
4. 构建应用：`npm run build`
5. 运行应用程序：`./run-mac-app.sh`

### 应用程序特性
- **原生体验**: 完整的macOS原生应用体验
- **系统通知**: 使用macOS原生通知系统，不会丢失
- **菜单栏集成**: 完整的macOS菜单栏集成
- **窗口管理**: 支持最小化、最大化和关闭操作
- **数据安全**: 所有数据存储在本地，无需网络权限

### 通知功能
- 日程提醒会通过macOS原生通知显示
- 点击通知会聚焦到应用程序窗口
- 通知包含日程标题、时间和描述信息
- 支持设置不同的提醒提前时间

## 🪟 Windows应用程序使用指南

### 安装说明

#### 选项1：使用安装包（推荐）
1. 下载 `Lawyer Calendar Setup 1.0.0.exe` 安装包
2. 双击运行安装程序
3. 按照安装向导完成安装
4. 安装完成后，可在桌面或开始菜单找到应用程序图标

#### 选项2：使用便携版（无需安装）

**推荐版本（最高兼容性）：**
- `LawyerCalendar-Minimal-1.0.0.zip` (最小化版本，231MB，推荐用于兼容性问题)
- `LawyerCalendar-Portable-Windows-1.0.0.zip` (完整优化版本，106MB)

**备选版本：**
- `LawyerCalendar-Portable-Compatible-1.0.0.zip` (Python创建)
- `LawyerCalendar-Portable-1.0.0.zip` (zip命令创建)
- `Lawyer Calendar Portable 1.0.0.zip` (原始文件名，兼容性较低)
- `LawyerCalendar-Portable-1.0.0.tar.gz` (需要7-Zip解压)

**解压步骤：**
1. 下载便携版压缩包
2. 右键压缩文件 → 选择"全部提取"或"解压到当前文件夹"
3. 确保解压到非系统文件夹（建议桌面或Documents文件夹）
4. 双击解压后文件夹中的 `Lawyer Calendar.exe` 运行
5. 无需安装，移动或删除文件夹即可卸载

**解压助手：**
运行 `extract-portable.bat` 获取详细的解压指导

### 应用程序特性
- **原生体验**: 完整的Windows原生应用体验
- **系统通知**: 使用Windows原生通知系统
- **任务栏集成**: 支持任务栏固定和跳转列表
- **窗口管理**: 支持最小化到托盘、最大化和关闭操作
- **数据安全**: 所有数据存储在本地，无需网络权限

### 通知功能
- 日程提醒会通过Windows操作中心显示
- 点击通知会聚焦到应用程序窗口
- 通知包含日程标题、时间和描述信息
- 支持设置不同的提醒提前时间

### 卸载程序
- 通过Windows设置 > 应用 > 应用和功能卸载
- 或使用安装目录下的uninstall.exe

### 故障排除

#### 安装失败："此应用无法在你的电脑上运行"
这是最常见的架构兼容性错误，解决方案：

**立即诊断**：
```batch
# 运行架构检测工具
check-windows-arch.bat
```
或使用PowerShell：
```powershell
.\check-windows-arch.ps1
```

**解决方案**：
1. **确认系统架构**：
   - 右键"此电脑" → 属性 → 查看"系统类型"
   - 如果显示"64位操作系统"，当前安装包兼容
   - 如果显示"32位操作系统"，需要32位版本

2. **使用便携版**：
   - 下载 `Lawyer Calendar Portable 1.0.0.zip`
   - 解压到任意文件夹
   - 直接运行 `Lawyer Calendar.exe`

3. **如果是32位系统**：
   - 升级到64位Windows (推荐)
   - 或联系开发者获取32位版本

#### 安装失败："Installer integrity check has failed"
如果遇到此错误，请尝试：
1. **以管理员身份运行**：右键安装包，选择"以管理员身份运行"
2. **关闭安全软件**：临时关闭杀毒软件或防火墙
3. **检查磁盘空间**：确保有足够的磁盘空间（至少100MB）
4. **验证安装包完整性**：
   ```batch
   verify-installer.bat
   ```
   或使用PowerShell：
   ```powershell
   .\verify-installer.ps1
   ```

#### 应用程序无法启动
1. 确保您的Windows版本支持（Windows 10/11）
2. 检查是否安装了所有必要的系统更新
3. 以管理员身份运行应用程序

#### ZIP文件解压失败或"压缩文件夹错误"

**可能原因：**
- 文件名含空格导致兼容性问题
- ZIP文件格式不完全兼容
- 安全软件阻止解压

**解决方案：**

1. **使用兼容版本（推荐）**：
   - 下载 `LawyerCalendar-Portable-Compatible-1.0.0.zip` (Python创建，最高兼容性)

2. **使用无空格文件名版本**：
   - 下载 `LawyerCalendar-Portable-1.0.0.zip` 而不是 `Lawyer Calendar Portable 1.0.0.zip`

2. **使用Windows内置解压**：
   - 右键ZIP文件 → "全部提取"
   - 选择解压目标文件夹（桌面或Documents）

3. **如果仍失败，使用7-Zip**：
   - 下载并安装 7-Zip (https://7-zip.org)
   - 用7-Zip打开ZIP文件
   - 选择"提取"并指定目标文件夹

4. **使用TAR.GZ版本**：
   - 下载 `LawyerCalendar-Portable-1.0.0.tar.gz`
   - 使用7-Zip解压两次（先解压GZ，再解压TAR）

5. **运行解压助手**：
   - 下载 `extract-portable.bat`
   - 与压缩包放在同一目录
   - 运行批处理文件获取详细指导

6. **使用最小化版本**：
   - 下载 `LawyerCalendar-Minimal-1.0.0.zip`
   - 这个版本只包含核心文件，兼容性最高
   - 如果成功，再尝试完整版本

7. **运行故障排除工具**：
   - 下载 `troubleshoot-zip.bat`
   - 运行它来诊断ZIP文件问题

**解压位置建议：**
- ✅ 桌面文件夹
- ✅ Documents文件夹
- ✅ 非系统盘的其他文件夹
- ❌ C:\Program Files
- ❌ 系统文件夹

#### 通知功能不工作
1. 确保在Windows设置中启用了通知
2. 检查应用程序是否有通知权限
3. 重启应用程序后重试

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 📄 许可证

MIT License
