const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js') // 如果需要的话
    },
    icon: path.join(__dirname, 'public/vite.svg'), // 应用图标
    show: false // 先隐藏窗口，直到加载完成
  });

  // 加载应用的index.html
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173'); // Vite开发服务器
    mainWindow.webContents.openDevTools(); // 开发模式下打开开发者工具
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html')); // 生产模式加载构建文件
  }

  // 当窗口准备好显示时显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 当窗口被关闭时触发
  mainWindow.on('closed', () => {
    // 取消引用窗口对象
    mainWindow = null;
  });
}

// 当Electron完成初始化时触发
app.whenReady().then(createWindow);

// 当所有窗口都关闭时退出应用（Windows & Linux）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 当应用被激活时（macOS）
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 安全措施：阻止新窗口的创建
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    require('electron').shell.openExternal(navigationUrl);
  });
});
