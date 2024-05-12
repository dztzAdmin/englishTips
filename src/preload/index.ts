import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import * as severs from './severs'
import * as stores from './stores'
// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('severs', severs)
    contextBridge.exposeInMainWorld('stores', stores)
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.severs = severs
}
// @ts-ignore (define in dts)
window.stores = stores
