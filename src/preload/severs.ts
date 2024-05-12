import { FileFilter, ipcRenderer } from 'electron'
import { readFile } from 'fs/promises'
interface RequireWarp<T> {
  data: T
  code: number
  message: string | null
}

export type FileFilterType = {
  name: string
  extensions: string[] //后缀名数组
}

type FileData = {
  fileData: Buffer | string | null
  path: string
  fileName: string
}[]

const readFileFun = async (path: string): Promise<Buffer | null> => {
  try {
    const data = await readFile(path)
    return data
  } catch (error) {
    console.error('Error reading file:', error)
    return null
  }
}

/**打开文件选择框 */
const openFileAPI = async (
  Filefilter: FileFilter,
  isString?: boolean
): Promise<RequireWarp<FileData | null>> => {
  try {
    console.log('invoke open-file-dialog')
    const result: { filePaths: string[] } = await ipcRenderer.invoke('open-file-dialog', {
      Filefilter
    })
    if (result.filePaths.length > 0) {
      console.log('选中的文件路径:', result.filePaths)
      const FileData: FileData = []
      for (const path of result.filePaths) {
        const fileName = path.split('\\').slice(-1)[0]
        const result = await readFileFun(path)
        FileData.push({
          fileData: isString ? result?.toString() || null : result,
          path,
          fileName
        })
      }
      return {
        data: FileData,
        message: null,
        code: 0
      }
    } else {
      console.log('未选择文件')
      return {
        data: null,
        message: null,
        code: 0
      }
    }
  } catch (err) {
    console.error('文件选择错误:', err)
    return {
      data: null,
      message: '文件选择错误',
      code: 100
    }
  }
}
/**打开目录选择框 */
const exportJsonAPI = async (): Promise<RequireWarp<string | null>> => {
  try {
    console.log('invoke open-file-dialog')
    const result: { filePaths: string[] } = await ipcRenderer.invoke('open-file-dialog', {
      properties: ['openDirectory']
    })
    if (result.filePaths.length > 0) {
      console.log('选中的文件路径:', result.filePaths)

      return {
        data: result.filePaths[0],
        message: null,
        code: 0
      }
    } else {
      console.log('未选择文件')
      return {
        data: null,
        message: null,
        code: 0
      }
    }
  } catch (err) {
    console.error('文件选择错误:', err)
    return {
      data: null,
      message: '文件选择错误',
      code: 100
    }
  }
}
export { openFileAPI, exportJsonAPI }
