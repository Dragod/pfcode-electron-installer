// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')

const path = require('path')

const fs = require('fs')

let mainWindow, secondaryWindow

async function createWindow () {

  // Create the browser window.

  mainWindow = new BrowserWindow({
    title: "Pfcode Installer v1.0.0",
    width: 1000,
    minWidth: 1000,
    maxWidth: 1000,
    height: 750,
    minHeight: 750,
    maxHeight: 750,
    fullscreenable: false,
    resizable: false,
    icon: __dirname + './favicon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true

    },
    backgroundColor: '#222436',
    darkTheme: true,
    center: true,
    maximizable: false,
    minimizable: true,

  })

  //mainWindow.setMenu(null)

  mainWindow.loadFile('./src/index.html')

  // Open the DevTools.

  mainWindow.webContents.openDevTools()

}

async function createQrWindow(){

  secondaryWindow = new BrowserWindow({
    title: "Pfcode Installer v1.0.0",
    width: 503,
    height: 522,
    fullscreenable: false,
    resizable: false,
    icon: __dirname + './favicon.ico',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload1.js'),
      nodeIntegration: true

    },
    backgroundColor: '#222436',
    darkTheme: true,
    center: true,
    maximizable: false,
    minimizable: false,
    alwaysOnTop: true,
    show: false,

  });

  secondaryWindow.loadFile('./src/secondary.html');

  secondaryWindow.setMenu(null)


  ipcMain.on('request-update-label-in-second-window', (event, arg) => {

    secondaryWindow.show()

    secondaryWindow.webContents.send('action-update-label', arg);

  });

  secondaryWindow.on('close',  (e) => {

    e.preventDefault();    // This will cancel the close
    secondaryWindow.hide();

  })

}

ipcMain.on('open-error-dialog',  () => {

  dialog.showErrorBox('Qrcode error', 'Data is too big to generate a QR Code, max 20 apps.')

})

ipcMain.on('config-winget', () => {

  dialog.showErrorBox('Config file error', 'The config file does not contain a winget array. Please check the config file.')

})

ipcMain.on('config-winget-empty', () => {

  dialog.showErrorBox('Config file error', 'The config file does not contain any app/s, the array is empty. Please check the config file.')

})

ipcMain.on('config-preset-empty', () => {

  dialog.showErrorBox('Config file error', 'The config file need to specify a preset name. Please check the config file.')

})

ipcMain.on('config-preset-undefined', () => {

  dialog.showErrorBox('Config file error', 'The config file need a preset. Please check the config file.')

})

function getConfig() {

  ipcMain.handle('dialog:openFile', async () => {

    const dialogue = await dialog.showOpenDialog(
      {
        properties: ['openFile'],

        title: 'Pfcode Installer',

        defaultPath : "C:",

        buttonLabel: 'Select config file',

        filters: [{ name: '*', extensions: ['json'] }],

        message: 'Select a config file'

      })

      if (!dialogue.canceled) {

        try { return JSON.parse(fs.readFileSync(dialogue.filePaths[0], 'utf8')) }

        catch (error) {

          dialog.showErrorBox("Config file error", `Either the config file is empty or there was an erro: ${error}`)

        }

      }
      else if (dialogue.canceled) { return }

  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  getConfig()

  createWindow()

  createQrWindow()

  // const mainMenu = Menu.buildFromTemplate(menu)

  // Menu.setApplicationMenu(mainMenu)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// const menu = [
//   {
//     label: 'App',
//     submenu: [
//       {
//         label: 'Quit',
//         accelerator: 'Ctrl+Q',
//         click: () => app.quit()
//       }
//     ]
//   }
// ]

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {

  if (process.platform !== 'darwin') app.quit()

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
