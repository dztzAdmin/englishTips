import { ElectronAPI } from '@electron-toolkit/preload'
import * as severs from './severs'
import * as stores from './stores'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    severs: typeof severs
    stores: typeof stores
  }
}
