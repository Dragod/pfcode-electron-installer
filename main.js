// Modules to control application life and create native browser window

const {app, BrowserWindow,Menu, ipcMain, dialog} = require('electron')
const path = require('path')
const fs = require('fs')

async function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: "Pfcode Installer Electron",
    width: 1000,
    minWidth: 1000,
    maxWidth: 1000,
    height: 750,
    minHeight: 750,
    maxHeight: 750,
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true

    },

  })

  //mainWindow.setMenu(null)

  mainWindow.loadFile('./src/index.html')

  // Open the DevTools.

  mainWindow.webContents.openDevTools()

}

ipcMain.on('open-error-dialog', function (event) {

  dialog.showErrorBox('Qrcode error', 'Data is too big to generate a QR Code, please select 25 or less apps.')
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  ipcMain.handle('dialog:openFile', async () => {

    const dialogue = await dialog.showOpenDialog(
      {
        properties: ['openFile'],

        title: 'Pfcode Installer',

        defaultPath : "C:",

        buttonLabel: 'Select config file',

        filters: [{ name: '*', extensions: ['json'] }]

      })

      if (!dialogue.canceled) {

        try { return JSON.parse(fs.readFileSync(dialogue.filePaths[0], 'utf8')) }

        catch (error) {

          dialog.showErrorBox("Error", `There was an error reading from the json file: ${error}`)

        }

      }
      else {

        dialog.showErrorBox("Error", "Invalid config file, please choose a valid json file.")

      }

  })

  createWindow()

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
//     label: 'Config',
//     submenu: [
//       {
//         label: 'Load',
//         accelerator: 'Ctrl+Q',
//         click: () => getConfig()
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
