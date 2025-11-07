const { contextBridge, ipcRenderer } = require('electron');

// 检测是否在Electron环境中
const isElectron = typeof window !== 'undefined' && window.process && window.process.type === 'renderer';

// 暴露系统通知API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 系统通知相关
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),
  checkNotificationPermission: () => ipcRenderer.invoke('check-notification-permission'),

  // 平台信息
  platform: process.platform,

  // 应用版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// 标记为Electron环境
if (isElectron) {
  window.isElectron = true;
}
