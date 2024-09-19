const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    captureScreen: () => ipcRenderer.send('capture-screen')
});

ipcRenderer.on('screenshot-taken', (event, data) => {
    // Functionality to process screenshot will go here
});