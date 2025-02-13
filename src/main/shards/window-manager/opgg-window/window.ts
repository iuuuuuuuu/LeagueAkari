import { is } from '@electron-toolkit/utils'
import { i18next } from '@main/i18n'
import { AkariLogger } from '@main/shards/logger-factory'
import { SetterSettingService } from '@main/shards/setting-factory/setter-setting-service'
import { BrowserWindow, dialog, screen, shell } from 'electron'
import { comparer, computed } from 'mobx'
import path from 'node:path'

import type { WindowManagerMainContext } from '..'
import icon from '../../../../../resources/OPGG_ICON.ico?asset'
import { OpggWindowSettings, OpggWindowState } from './state'
import { repositionWindowIfInvisible } from '../position-utils'

export class AkariOpggWindow {
  static PARTITION = 'persist:opgg-window'

  static INITIAL_SHOW = false
  static BASE_WIDTH = 480
  static BASE_HEIGHT = 720
  static MIN_WIDTH = 530
  static MIN_HEIGHT = 530

  public readonly settings = new OpggWindowSettings()
  public readonly state = new OpggWindowState()

  private readonly _setting: SetterSettingService
  private readonly _log: AkariLogger

  private _forceClose = false
  private _window: BrowserWindow | null = null

  private _namespace: string

  get window() {
    return this._window
  }

  constructor(private _context: WindowManagerMainContext) {
    this._namespace = `${_context.namespace}/opgg-window`
    this._setting = _context.settingFactory.register(
      this._namespace,
      {
        enabled: { default: this.settings.enabled },
        autoShow: { default: this.settings.autoShow },
        opacity: { default: this.settings.opacity },
        pinned: { default: this.settings.pinned }
      },
      this.settings
    )
    this._log = _context.loggerFactory.create(this._namespace)
  }

  async onInit() {
    await this._setting.applyToState()

    this._context.mobx.propSync(this._namespace, 'state', this.state, ['focus', 'ready', 'status'])

    this._context.mobx.propSync(this._namespace, 'settings', this.settings, [
      'enabled',
      'autoShow',
      'opacity',
      'pinned'
    ])

    this._setting.onChange('pinned', (value, { setter }) => {
      if (this._window) {
        this._window.setAlwaysOnTop(value, 'normal')
      }
      setter()
    })

    const bounds = await this._setting._getFromStorage('bounds')
    if (bounds) {
      this.state.setBounds(bounds)
    }

    this._handleObservations()
    this._handleIpcCall()
  }

  private _handleObservations() {
    const showTiming = computed(() => {
      if (!this.settings.autoShow) {
        return 'ignore'
      }

      if (!this.state.ready) {
        return 'ignore'
      }

      switch (this._context.leagueClient.data.gameflow.phase) {
        case 'ChampSelect':
          return 'show'
      }

      return 'normal'
    })

    // 在英雄选择阶段会主动展示, 其他阶段不会主动关闭
    this._context.mobx.reaction(
      () => showTiming.get(),
      (timing) => {
        if (timing === 'show') {
          this.showOrRestore(true)
        }
      }
    )

    this._context.mobx.reaction(
      () => this.state.bounds,
      (bounds) => {
        if (bounds) {
          this._setting._saveToStorage('bounds', bounds)
        }
      },
      { delay: 250, equals: comparer.shallow }
    )

    this._context.mobx.reaction(
      () => this.settings.opacity,
      (o) => {
        this._window?.setOpacity(o)
      },
      { fireImmediately: true }
    )

    this._context.mobx.reaction(
      () => [this.settings.enabled, this._context.windowManager.state.isShardsReady] as const,
      ([enabled, ready]) => {
        if (!ready) {
          return
        }

        if (enabled) {
          this.createWindow()
        } else {
          this.closeWindow(true)
        }
      },
      { fireImmediately: true, delay: 500, equals: comparer.shallow }
    )
  }

  private _handleIpcCall() {
    this._context.ipc.onCall(this._namespace, 'setSize', async (_, width, height, animate) => {
      this._window?.setSize(width, height, animate)
    })

    this._context.ipc.onCall(this._namespace, 'getSize', async () => {
      return this._window?.getSize()
    })

    this._context.ipc.onCall(this._namespace, 'minimize', async () => {
      this._window?.minimize()
    })

    this._context.ipc.onCall(this._namespace, 'unmaximize', async () => {
      this._window?.unmaximize()
    })

    this._context.ipc.onCall(this._namespace, 'restore', async () => {
      this._window?.restore()
    })

    this._context.ipc.onCall(this._namespace, 'close', async () => {
      this._window?.close()
    })

    this._context.ipc.onCall(this._namespace, 'toggleDevtools', async () => {
      this._window?.webContents.toggleDevTools()
    })

    this._context.ipc.onCall(this._namespace, 'setTitle', (_, title) => {
      this._window?.setTitle(title)
    })

    this._context.ipc.onCall(this._namespace, 'hide', () => {
      this.hideWindow()
    })

    this._context.ipc.onCall(this._namespace, 'show', (_, inactive: boolean = false) => {
      this.showOrRestore(inactive)
    })

    this._context.ipc.onCall(this._namespace, 'resetWindowPosition', () => {
      this.resetPosition()
    })

    this._context.ipc.onCall(this._namespace, 'setWindowSize', (_, width, height) => {
      this._window?.setSize(width, height)
    })

    this._context.ipc.onCall(this._namespace, 'getWindowSize', () => {
      const [width, height] = this._window?.getSize() || []
      return { width, height }
    })
  }

  createWindow() {
    if (!this._window || this._window.isDestroyed()) {
      this._createWindow()
    }
  }

  private _createWindow() {
    this._window = new BrowserWindow({
      minWidth: AkariOpggWindow.MIN_WIDTH,
      minHeight: AkariOpggWindow.MIN_HEIGHT,
      resizable: true,
      frame: false,
      show: AkariOpggWindow.INITIAL_SHOW,
      title: 'OP.GG Akari',
      autoHideMenuBar: true,
      maximizable: false,
      minimizable: true,
      icon,
      fullscreenable: false,
      skipTaskbar: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false,
        spellcheck: false,
        backgroundThrottling: false,
        partition: AkariOpggWindow.PARTITION
      }
    })

    this._window.webContents.on('before-input-event', (event, input) => {
      if (
        (input.control && input.key.toLowerCase() === 'w') ||
        (input.control && input.key.toLowerCase() === 'r') ||
        (input.meta && input.key.toLowerCase() === 'r')
      ) {
        event.preventDefault()
      }
    })

    this.state.setShow(AkariOpggWindow.INITIAL_SHOW)

    if (this.state.bounds) {
      this._window.setBounds(this.state.bounds)
    } else {
      this._window.setSize(AkariOpggWindow.BASE_WIDTH, AkariOpggWindow.BASE_HEIGHT)
    }

    this._window.setOpacity(this.settings.opacity)
    this._window.setAlwaysOnTop(this.settings.pinned, 'normal')

    this._window.webContents.on('did-finish-load', () => {
      this._window?.webContents.setZoomFactor(1.0)
    })

    this._window.webContents.setWindowOpenHandler((details) => {
      dialog
        .showMessageBox(this._window!, {
          type: 'question',
          buttons: [i18next.t('common.yes'), i18next.t('common.no')],
          defaultId: 0,
          title: i18next.t('common.confirm'),
          message: i18next.t('windowOpenHandler.toExternalLink', {
            target: new URL(details.url).origin
          }),
          detail: details.url
        })
        .then((r) => {
          if (r.response === 0) {
            shell.openExternal(details.url)
          }
        })

      return { action: 'deny' }
    })

    this._window.on('ready-to-show', () => {
      this.state.setReady(true)
      repositionWindowIfInvisible(this._window!)
    })

    if (this._window.isMinimized()) {
      this.state.setStatus('minimized')
    } else {
      this.state.setStatus('normal')
    }

    this._window.on('unmaximize', () => {
      this.state.setStatus('normal')
    })

    this._window.on('minimize', () => {
      this.state.setStatus('minimized')
    })

    this._window.on('restore', () => {
      this.state.setStatus('normal')
    })

    this._window.on('focus', () => {
      this.state.setFocus('focused')
    })

    this._window.on('blur', () => {
      this.state.setFocus('blurred')
    })

    this._window.on('show', () => {
      this.state.setShow(true)
    })

    this._window.on('hide', () => {
      this.state.setShow(false)
    })

    this._window.on('closed', () => {
      this.state.setReady(false)
      this._window = null
      this._log.info('OP.GG 窗口关闭')
    })

    this._window.on('move', () => {
      if (this._window) {
        const bounds = this._window.getBounds()
        this.state.setBounds(bounds)
      }
    })

    this._window.on('resize', () => {
      if (this._window) {
        const bounds = this._window.getBounds()
        this.state.setBounds(bounds)
      }
    })

    this._window.on('page-title-updated', (e) => e.preventDefault())

    this._window.on('close', (e) => {
      if (this._forceClose) {
        return
      }

      e.preventDefault()
      this.hideWindow()
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this._window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/opgg-window.html`)
    } else {
      this._window.loadFile(path.join(__dirname, '../renderer/opgg-window.html'))
    }

    this._log.info('创建 OP.GG 窗口')
  }

  closeWindow(force = false) {
    if (this._window) {
      this._forceClose = force
      this._window.close()
      this._forceClose = false
    }
  }

  resetPosition() {
    if (this._window) {
      const bounds = this._window.getBounds()
      const p = this._getCenteredRectangle(bounds.width, bounds.height)
      this._window.setSize(AkariOpggWindow.BASE_WIDTH, AkariOpggWindow.BASE_HEIGHT)
      this._window.setPosition(p.x, p.y)
    }

    this._log.info('重置 OP.GG 窗口位置到主显示器中心')
  }

  private _getCenteredRectangle(width: number, height: number) {
    let { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

    let x = Math.round((screenWidth - width) / 2)
    let y = Math.round((screenHeight - height) / 2)

    return { x, y, width, height }
  }

  toggleDevtools() {
    this._window?.webContents.toggleDevTools()
  }

  hideWindow() {
    if (this._window && this.state.show) {
      this._window.hide()
    }
  }

  showOrRestore(inactive = false) {
    if (this._window && this.state.ready) {
      if (!this.state.show) {
        if (inactive) {
          this._window.showInactive()
        } else {
          this._window.show()
        }

        return
      }

      if (this._window.isMinimized()) {
        this._window.restore()
      }
      this._window.focus()
    }
  }
}
