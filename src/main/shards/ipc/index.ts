import { IAkariShardInitDispose } from '@shared/akari-shard/interface'
import { isAxiosError } from 'axios'
import { IpcMainInvokeEvent, ipcMain, webContents } from 'electron'

export interface IpcMainSuccessDataType<T = any> {
  success: true
  data: T
}

export interface IpcMainErrorDataType<T = any> {
  success: false
  error: T
}

export type IpcMainDataType<T = any> = IpcMainSuccessDataType<T> | IpcMainErrorDataType<T>

/**
 * League Akari 的 IPC 主进程实现
 */
export class AkariIpcMain implements IAkariShardInitDispose {
  static id = 'akari-ipc-main'

  /**
   * 调用映射, 对应不同 namespace 的调用
   */
  private _callMap = new Map<string, Function>()
  private _renderers = new Set<number>()

  constructor() {
    this._handleRendererInvocation = this._handleRendererInvocation.bind(this)
    this._handleRendererRegister = this._handleRendererRegister.bind(this)
  }

  private _handleRendererInvocation(
    _event: IpcMainInvokeEvent,
    namespace: string,
    fnName: string,
    ...args: any[]
  ) {
    const key = `${namespace}:${fnName}`
    const fn = this._callMap.get(key)

    if (!fn) {
      throw new Error(`No function "${fnName}" in namespace "${namespace}"`)
    }

    return AkariIpcMain._standardizeIpcData(() => fn(...args))
  }

  /**
   * 处理来自渲染进程的事件订阅
   * @param event
   * @param action 可选值 subscribe / unsubscribe
   */
  private _handleRendererRegister(event: IpcMainInvokeEvent, action = 'subscribe') {
    const id = event.sender.id

    if (action === 'register' && !this._renderers.has(id)) {
      this._renderers.add(id)
      event.sender.on('destroyed', () => this._renderers.delete(id))
      return { success: true }
    } else if (action === 'unregister' && this._renderers.has(id)) {
      this._renderers.delete(id)
      return { success: true }
    }

    return { success: false, error: { message: `invalid action "${action}"` } }
  }

  private static _standardizeIpcData(wrappedFn: Function) {
    try {
      const result = wrappedFn()
      if (result instanceof Promise) {
        return result
          .then((res) => ({ success: true, data: res }))
          .catch((error: any) => AkariIpcMain._handleError(error))
      } else {
        return { success: true, data: result }
      }
    } catch (error) {
      return AkariIpcMain._handleError(error)
    }
  }

  async onInit() {
    ipcMain.handle('akari-call', this._handleRendererInvocation)
    ipcMain.handle('akari-renderer-register', this._handleRendererRegister)
  }

  async onDispose() {
    ipcMain.off('akari-call', this._handleRendererInvocation)
    ipcMain.off('akari-renderer-register', this._handleRendererRegister)
    this._callMap.clear()
  }

  sendEvent(namespace: string, eventName: string, ...args: any[]) {
    this._renderers.forEach((id) =>
      webContents.fromId(id)?.send('akari-event', namespace, eventName, ...args)
    )
  }

  onCall(namespace: string, fnName: string, cb: (...args: any[]) => Promise<any> | any) {
    const key = `${namespace}:${fnName}`
    if (this._callMap.has(key)) {
      throw new Error(`Function "${fnName}" in namespace "${namespace}" already exists`)
    }

    this._callMap.set(key, cb)
  }

  private static _handleError(error: any): IpcMainDataType {
    if (isAxiosError(error)) {
      const errorWithResponse = {
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            }
          : null,
        code: error.code,
        message: error.message,
        stack: error.stack,
        name: error.name
      }

      return {
        success: false,
        error: errorWithResponse
      }
    } else if (error instanceof Error) {
      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      }
    }

    return {
      success: false,
      error: { message: 'An error occurred' }
    }
  }
}
