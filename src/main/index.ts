import { app, shell, BrowserWindow, ipcMain, dialog, FileFilter, OpenDialogOptions } from 'electron'
import { join } from 'path'
import { readFile } from 'fs/promises'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

const readFileFun = async (path: string): Promise<Buffer | null> => {
  try {
    const data = await readFile(path)
    return data
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 2560,
    height: 1000,
    show: false,
    // x: 120,
    // y: -900,
    // frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  // 注册处理函数，响应渲染进程
  ipcMain.handle(
    'open-file-dialog',
    async (
      e,
      options: {
        isString: boolean
        Filefilter?: FileFilter
        properties?: OpenDialogOptions['properties']
      } = {
        isString: false,
        properties: ['openFile']
      }
    ) => {
      console.log('open-file-dialog的事件对象', e, options)
      try {
        const result = await dialog.showOpenDialog(mainWindow, {
          properties: options.properties,
          filters: options.Filefilter ? [options.Filefilter] : []
        })
        if (result.canceled) {
          return {}
        } else {
          console.log('选中的文件路径:', result.filePaths)
          const FileDatas: any[] = []
          for (const path of result.filePaths) {
            const fileName = path.split('\\').slice(-1)[0]
            const result = await readFileFun(path)
            console.log(result, 'result')
            // let newResult: {
            //   textContent: string
            //   textContentObjs: TextContent[]
            // } | null = null
            /**判断是否为pdf文件,如果是那么进行pdf转换 */
            // if (path.endsWith('.pdf') && result) {
            //   newResult = await PdfToText(result)
            // }
            FileDatas.push({
              fileData: options.isString ? result?.toString() || null : result,
              path,
              fileName
            })
          }
          console.log(FileDatas, 'FileData')
          return { FileDatas }
        }
      } catch (err) {
        console.error(err)
        return { error: err }
      }
    }
  )
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  //启动开发者界面
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
