const { app, BrowserWindow, ipcMain, screen, globalShortcut } = require('electron');
const path = require('path');
const { desktopCapturer } = require('electron');

let mainWindow;
var ignoreBack = true;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.setIgnoreMouseEvents(ignoreBack);
}

app.whenReady().then(() => {
    createWindow();
    globalShortcut.register('CommandOrControl+W', () => {
        console.log('CommandOrControl+W is pressed');

        if (ignoreBack) {
            ignoreBack = false;
            mainWindow.setIgnoreMouseEvents(ignoreBack);
            mainWindow.webContents.send('key-pressed-true', 'Key W was pressed');
        } else {
            ignoreBack = true;
            mainWindow.setIgnoreMouseEvents(ignoreBack);
            mainWindow.webContents.send('key-pressed-false', 'Key W was pressed');
        }
        // You can also send an IPC message to the renderer process here if needed

    });

})
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        globalShortcut.unregisterAll();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
ipcMain.on('log-sys', async (event, msg) => {

    console.log("log", msg)
});

ipcMain.on('open-url', (event, url) => {
    console.log("abre link", url)
    require('electron').shell.openExternal(url);
    ignoreBack = true;
    mainWindow.setIgnoreMouseEvents(ignoreBack);
    mainWindow.webContents.send('key-pressed-false', 'Key W was pressed');
});