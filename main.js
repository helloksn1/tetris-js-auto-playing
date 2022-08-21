const { app, BrowserWindow, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
let main_ui = null;

function createWindow () {
  main_ui = new BrowserWindow({
    width: 470,
    height: 520,
    webPreferences: {
      nodeIntegration: true
    }
  })

  main_ui.setMenu(null);
  main_ui.loadFile('index.html');
  // main_ui.webContents.openDevTools();
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
