import { FileFilter, ipcRenderer } from 'electron'
// import { readFile } from 'fs/promises'
// import PdfToText from '../main/utils/pdfToText'
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
}

/**打开文件选择框 */
const openFileAPI = async (
  Filefilter: FileFilter,
  isString?: boolean
): Promise<RequireWarp<FileData | null>> => {
  try {
    console.log('invoke open-file-dialog')
    const result: { FileDatas: FileData[] } = await ipcRenderer.invoke('open-file-dialog', {
      Filefilter,
      isString
    })
    if (result.FileDatas.length > 0) {
      console.log('选中的文件路径:', result)

      return {
        data: result.FileDatas[0],
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
