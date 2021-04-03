const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  if (process.env.DEV_TOOL) {
    mainWindow.webContents.openDevTools();
  }

  const readDb = 'readDb'
  const dbFile = 'dbusy.json'
  ipcMain.on(readDb, (event, arg) => {
    let content = JSON.parse(fs.readFileSync(dbFile))
    event.reply(readDb, content)
  })

  ipcMain.on('writeDb', (event, arg) => {
    fs.writeFile(dbFile, JSON.stringify(arg, null, 2), () => { })
  })

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

try {
  require('electron-reloader')(module);
} catch { }

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
