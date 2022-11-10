// Modules to control application life and create native browser window
const {app, BrowserWindow,Menu} = require('electron')
const path = require('path')

const ipc = require('electron').ipcMain

const dialog = require('electron').dialog

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "Pfcode Installer Electron",
    width: 1200,
    height: 750,
    minWidth: 1200,
    minHeight: 750,
    maxWidth: 1200,
    maxHeight: 750,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true

    },

  })

  mainWindow.webContents.send("foo","bar");

  // const secondaryWindow = new BrowserWindow({
  //   title: 'Config',
  //   width: 400,
  //   height: 300,
  //   webPreferences: {
  //     preload: path.join(__dirname, 'preload.js'),
  //     nodeIntegration: true,
  //   },
  //   parent: mainWindow,
  //   modal: true,
  //   show: false,
  //   frame: false,
  //   resizable: false,
  //   fullscreenable: false,
  //   maximizable: false,
  //   minimizable: false
  // })

  // and load the index.html of the app.
  //mainWindow.setMenu(null)
  mainWindow.loadFile('./src/index.html')
  //secondaryWindow.loadFile('./src/secondary.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

ipc.on('open-error-dialog', function (event) {

  dialog.showErrorBox('Qrcode error', 'Data is too big to generate a QR Code, please select 25 or less apps.')
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  createWindow()

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

function getConfig() {

  dialog.showOpenDialog(
    {
      properties: ['openFile'],

      title: 'Pfcode Installer',

      defaultPath : "C:",

      buttonLabel: 'Select config file',

      filters: [
        { name: 'programs', extensions: ['json'] },
        { name: 'default', extensions: ['json'] },
      ]

    }).then(result => {

      const fs = require('fs')

      try {

        const config = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'))

        console.log(config)

      } catch (error) {

        dialog.showErrorBox("Error", "Invalid config file, please choose a valid json file.")

      }

    }).catch(err => {

      console.log(err)

    })

}


const menu = [
  {
    label: 'Config',
    submenu: [
      {
        label: 'Load',
        accelerator: 'Ctrl+Q',
        click: () => getConfig()
      }
    ]
  }
]

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
