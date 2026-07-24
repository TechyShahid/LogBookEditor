const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  if (!app.isReady()) {
    return;
  }

  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    title: 'LogBook Editor',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
