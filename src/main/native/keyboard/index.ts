import EventEmitter from 'events'

import input from '../laInputWin32x64.node'

const keyMap = {
  0x30: { _nameRaw: 'VK_0', name: '0', standardName: '0' },
  0x31: { _nameRaw: 'VK_1', name: '1', standardName: '1' },
  0x32: { _nameRaw: 'VK_2', name: '2', standardName: '2' },
  0x33: { _nameRaw: 'VK_3', name: '3', standardName: '3' },
  0x34: { _nameRaw: 'VK_4', name: '4', standardName: '4' },
  0x35: { _nameRaw: 'VK_5', name: '5', standardName: '5' },
  0x36: { _nameRaw: 'VK_6', name: '6', standardName: '6' },
  0x37: { _nameRaw: 'VK_7', name: '7', standardName: '7' },
  0x38: { _nameRaw: 'VK_8', name: '8', standardName: '8' },
  0x39: { _nameRaw: 'VK_9', name: '9', standardName: '9' },
  0x41: { _nameRaw: 'VK_A', name: 'A', standardName: 'A' },
  0x42: { _nameRaw: 'VK_B', name: 'B', standardName: 'B' },
  0x43: { _nameRaw: 'VK_C', name: 'C', standardName: 'C' },
  0x44: { _nameRaw: 'VK_D', name: 'D', standardName: 'D' },
  0x45: { _nameRaw: 'VK_E', name: 'E', standardName: 'E' },
  0x46: { _nameRaw: 'VK_F', name: 'F', standardName: 'F' },
  0x47: { _nameRaw: 'VK_G', name: 'G', standardName: 'G' },
  0x48: { _nameRaw: 'VK_H', name: 'H', standardName: 'H' },
  0x49: { _nameRaw: 'VK_I', name: 'I', standardName: 'I' },
  0x4a: { _nameRaw: 'VK_J', name: 'J', standardName: 'J' },
  0x4b: { _nameRaw: 'VK_K', name: 'K', standardName: 'K' },
  0x4c: { _nameRaw: 'VK_L', name: 'L', standardName: 'L' },
  0x4d: { _nameRaw: 'VK_M', name: 'M', standardName: 'M' },
  0x4e: { _nameRaw: 'VK_N', name: 'N', standardName: 'N' },
  0x4f: { _nameRaw: 'VK_O', name: 'O', standardName: 'O' },
  0x50: { _nameRaw: 'VK_P', name: 'P', standardName: 'P' },
  0x51: { _nameRaw: 'VK_Q', name: 'Q', standardName: 'Q' },
  0x52: { _nameRaw: 'VK_R', name: 'R', standardName: 'R' },
  0x53: { _nameRaw: 'VK_S', name: 'S', standardName: 'S' },
  0x54: { _nameRaw: 'VK_T', name: 'T', standardName: 'T' },
  0x55: { _nameRaw: 'VK_U', name: 'U', standardName: 'U' },
  0x56: { _nameRaw: 'VK_V', name: 'V', standardName: 'V' },
  0x57: { _nameRaw: 'VK_W', name: 'W', standardName: 'W' },
  0x58: { _nameRaw: 'VK_X', name: 'X', standardName: 'X' },
  0x59: { _nameRaw: 'VK_Y', name: 'Y', standardName: 'Y' },
  0x5a: { _nameRaw: 'VK_Z', name: 'Z', standardName: 'Z' },
  0x01: { _nameRaw: 'VK_LBUTTON', name: 'LBUTTON', standardName: 'MOUSE LEFT' },
  0x02: { _nameRaw: 'VK_RBUTTON', name: 'RBUTTON', standardName: 'MOUSE RIGHT' },
  0x03: { _nameRaw: 'VK_CANCEL', name: 'CANCEL', standardName: '' },
  0x04: { _nameRaw: 'VK_MBUTTON', name: 'MBUTTON', standardName: 'MOUSE MIDDLE' },
  0x05: { _nameRaw: 'VK_XBUTTON1', name: 'XBUTTON1', standardName: 'MOUSE X1' },
  0x06: { _nameRaw: 'VK_XBUTTON2', name: 'XBUTTON2', standardName: 'MOUSE X2' },
  0x08: { _nameRaw: 'VK_BACK', name: 'BACK', standardName: 'BACKSPACE' },
  0x09: { _nameRaw: 'VK_TAB', name: 'TAB', standardName: 'TAB' },
  0x0d: { _nameRaw: 'VK_RETURN', name: 'RETURN', standardName: 'RETURN' },
  0x10: { _nameRaw: 'VK_SHIFT', name: 'SHIFT', standardName: '' },
  0x11: { _nameRaw: 'VK_CONTROL', name: 'CONTROL', standardName: '' },
  0x12: { _nameRaw: 'VK_MENU', name: 'MENU', standardName: '' },
  0x13: { _nameRaw: 'VK_PAUSE', name: 'PAUSE', standardName: '' },
  0x14: { _nameRaw: 'VK_CAPITAL', name: 'CAPSLOCK', standardName: 'CAPS LOCK' },
  0x15: { _nameRaw: 'VK_KANA', name: 'KANA', standardName: '' },
  0x16: { _nameRaw: 'VK_IME_ON', name: 'IME_ON', standardName: '' },
  0x17: { _nameRaw: 'VK_JUNJA', name: 'JUNJA', standardName: '' },
  0x18: { _nameRaw: 'VK_FINAL', name: 'FINAL', standardName: '' },
  0x19: { _nameRaw: 'VK_HANJA', name: 'HANJA', standardName: '' },
  0x1a: { _nameRaw: 'VK_IME_OFF', name: 'IME_OFF', standardName: '' },
  0x1b: { _nameRaw: 'VK_ESCAPE', name: 'ESCAPE', standardName: 'ESCAPE' },
  0x1c: { _nameRaw: 'VK_CONVERT', name: 'CONVERT', standardName: '' },
  0x1d: { _nameRaw: 'VK_NONCONVERT', name: 'NONCONVERT', standardName: '' },
  0x1e: { _nameRaw: 'VK_ACCEPT', name: 'ACCEPT', standardName: '' },
  0x1f: { _nameRaw: 'VK_MODECHANGE', name: 'MODECHANGE', standardName: '' },
  0x20: { _nameRaw: 'VK_SPACE', name: 'SPACE', standardName: 'SPACE' },
  0x21: { _nameRaw: 'VK_PRIOR', name: 'PRIOR', standardName: 'PAGE UP' },
  0x22: { _nameRaw: 'VK_NEXT', name: 'NEXT', standardName: 'PAGE DOWN' },
  0x23: { _nameRaw: 'VK_END', name: 'END', standardName: 'END' },
  0x24: { _nameRaw: 'VK_HOME', name: 'HOME', standardName: 'HOME' },
  0x25: { _nameRaw: 'VK_LEFT', name: 'LEFT', standardName: 'LEFT ARROW' },
  0x26: { _nameRaw: 'VK_UP', name: 'UP', standardName: 'UP ARROW' },
  0x27: { _nameRaw: 'VK_RIGHT', name: 'RIGHT', standardName: 'RIGHT ARROW' },
  0x28: { _nameRaw: 'VK_DOWN', name: 'DOWN', standardName: 'DOWN ARROW' },
  0x29: { _nameRaw: 'VK_SELECT', name: 'SELECT', standardName: '' },
  0x2a: { _nameRaw: 'VK_PRINT', name: 'PRINT', standardName: '' },
  0x2b: { _nameRaw: 'VK_EXECUTE', name: 'EXECUTE', standardName: '' },
  0x2c: { _nameRaw: 'VK_SNAPSHOT', name: 'SNAPSHOT', standardName: 'PRINT SCREEN' },
  0x2d: { _nameRaw: 'VK_INSERT', name: 'INSERT', standardName: 'INS' },
  0x2e: { _nameRaw: 'VK_DELETE', name: 'DELETE', standardName: 'DELETE' },
  0x2f: { _nameRaw: 'VK_HELP', name: 'HELP', standardName: '' },
  0x5b: { _nameRaw: 'VK_LWIN', name: 'LWIN', standardName: 'LEFT META' },
  0x5c: { _nameRaw: 'VK_RWIN', name: 'RWIN', standardName: 'RIGHT META' },
  0x5d: { _nameRaw: 'VK_APPS', name: 'APPS', standardName: '' },
  0x5f: { _nameRaw: 'VK_SLEEP', name: 'SLEEP', standardName: '' },
  0x60: { _nameRaw: 'VK_NUMPAD0', name: 'NUMPAD0', standardName: 'NUMPAD 0' },
  0x61: { _nameRaw: 'VK_NUMPAD1', name: 'NUMPAD1', standardName: 'NUMPAD 1' },
  0x62: { _nameRaw: 'VK_NUMPAD2', name: 'NUMPAD2', standardName: 'NUMPAD 2' },
  0x63: { _nameRaw: 'VK_NUMPAD3', name: 'NUMPAD3', standardName: 'NUMPAD 3' },
  0x64: { _nameRaw: 'VK_NUMPAD4', name: 'NUMPAD4', standardName: 'NUMPAD 4' },
  0x65: { _nameRaw: 'VK_NUMPAD5', name: 'NUMPAD5', standardName: 'NUMPAD 5' },
  0x66: { _nameRaw: 'VK_NUMPAD6', name: 'NUMPAD6', standardName: 'NUMPAD 6' },
  0x67: { _nameRaw: 'VK_NUMPAD7', name: 'NUMPAD7', standardName: 'NUMPAD 7' },
  0x68: { _nameRaw: 'VK_NUMPAD8', name: 'NUMPAD8', standardName: 'NUMPAD 8' },
  0x69: { _nameRaw: 'VK_NUMPAD9', name: 'NUMPAD9', standardName: 'NUMPAD 9' },
  0x6a: { _nameRaw: 'VK_MULTIPLY', name: 'MULTIPLY', standardName: 'NUMPAD MULTIPLY' },
  0x6b: { _nameRaw: 'VK_ADD', name: 'ADD', standardName: 'NUMPAD PLUS' },
  0x0c: { _nameRaw: 'VK_CLEAR', name: 'CLEAR', standardName: 'NUMPAD CLEAR' },
  0x6d: { _nameRaw: 'VK_SUBTRACT', name: 'SUBTRACT', standardName: 'NUMPAD MINUS' },
  0x6e: { _nameRaw: 'VK_DECIMAL', name: 'DECIMAL', standardName: 'NUMPAD DOT' },
  0x6f: { _nameRaw: 'VK_DIVIDE', name: 'DIVIDE', standardName: 'NUMPAD DIVIDE' },
  0x6c: { _nameRaw: 'VK_SEPARATOR', name: 'SEPARATOR', standardName: '' },
  0x70: { _nameRaw: 'VK_F1', name: 'F1', standardName: 'F1' },
  0x71: { _nameRaw: 'VK_F2', name: 'F2', standardName: 'F2' },
  0x72: { _nameRaw: 'VK_F3', name: 'F3', standardName: 'F3' },
  0x73: { _nameRaw: 'VK_F4', name: 'F4', standardName: 'F4' },
  0x74: { _nameRaw: 'VK_F5', name: 'F5', standardName: 'F5' },
  0x75: { _nameRaw: 'VK_F6', name: 'F6', standardName: 'F6' },
  0x76: { _nameRaw: 'VK_F7', name: 'F7', standardName: 'F7' },
  0x77: { _nameRaw: 'VK_F8', name: 'F8', standardName: 'F8' },
  0x78: { _nameRaw: 'VK_F9', name: 'F9', standardName: 'F9' },
  0x79: { _nameRaw: 'VK_F10', name: 'F10', standardName: 'F10' },
  0x7a: { _nameRaw: 'VK_F11', name: 'F11', standardName: 'F11' },
  0x7b: { _nameRaw: 'VK_F12', name: 'F12', standardName: 'F12' },
  0x7c: { _nameRaw: 'VK_F13', name: 'F13', standardName: 'F13' },
  0x7d: { _nameRaw: 'VK_F14', name: 'F14', standardName: 'F14' },
  0x7e: { _nameRaw: 'VK_F15', name: 'F15', standardName: 'F15' },
  0x7f: { _nameRaw: 'VK_F16', name: 'F16', standardName: 'F16' },
  0x80: { _nameRaw: 'VK_F17', name: 'F17', standardName: 'F17' },
  0x81: { _nameRaw: 'VK_F18', name: 'F18', standardName: 'F18' },
  0x82: { _nameRaw: 'VK_F19', name: 'F19', standardName: 'F19' },
  0x83: { _nameRaw: 'VK_F20', name: 'F20', standardName: 'F20' },
  0x84: { _nameRaw: 'VK_F21', name: 'F21', standardName: 'F21' },
  0x85: { _nameRaw: 'VK_F22', name: 'F22', standardName: 'F22' },
  0x86: { _nameRaw: 'VK_F23', name: 'F23', standardName: 'F23' },
  0x87: { _nameRaw: 'VK_F24', name: 'F24', standardName: 'F24' },
  0x90: { _nameRaw: 'VK_NUMLOCK', name: 'NUMLOCK', standardName: 'NUM LOCK' },
  0x91: { _nameRaw: 'VK_SCROLL', name: 'SCROLL', standardName: 'SCROLL LOCK' },
  0xa0: { _nameRaw: 'VK_LSHIFT', name: 'LSHIFT', standardName: 'LEFT SHIFT' },
  0xa1: { _nameRaw: 'VK_RSHIFT', name: 'RSHIFT', standardName: 'RIGHT SHIFT' },
  0xa2: { _nameRaw: 'VK_LCONTROL', name: 'LCONTROL', standardName: 'LEFT CTRL' },
  0xa3: { _nameRaw: 'VK_RCONTROL', name: 'RCONTROL', standardName: 'RIGHT CTRL' },
  0xa4: { _nameRaw: 'VK_LMENU', name: 'LALT', standardName: 'LEFT ALT' },
  0xa5: { _nameRaw: 'VK_RMENU', name: 'RALT', standardName: 'RIGHT ALT' },
  0xa6: { _nameRaw: 'VK_BROWSER_BACK', name: 'BROWSER_BACK', standardName: '' },
  0xa7: { _nameRaw: 'VK_BROWSER_FORWARD', name: 'BROWSER_FORWARD', standardName: '' },
  0xa8: { _nameRaw: 'VK_BROWSER_REFRESH', name: 'BROWSER_REFRESH', standardName: '' },
  0xa9: { _nameRaw: 'VK_BROWSER_STOP', name: 'BROWSER_STOP', standardName: '' },
  0xaa: { _nameRaw: 'VK_BROWSER_SEARCH', name: 'BROWSER_SEARCH', standardName: '' },
  0xab: { _nameRaw: 'VK_BROWSER_FAVORITES', name: 'BROWSER_FAVORITES', standardName: '' },
  0xac: { _nameRaw: 'VK_BROWSER_HOME', name: 'BROWSER_HOME', standardName: '' },
  0xad: { _nameRaw: 'VK_VOLUME_MUTE', name: 'VOLUME_MUTE', standardName: '' },
  0xae: { _nameRaw: 'VK_VOLUME_DOWN', name: 'VOLUME_DOWN', standardName: '' },
  0xaf: { _nameRaw: 'VK_VOLUME_UP', name: 'VOLUME_UP', standardName: '' },
  0xb0: { _nameRaw: 'VK_MEDIA_NEXT_TRACK', name: 'MEDIA_NEXT_TRACK', standardName: '' },
  0xb1: { _nameRaw: 'VK_MEDIA_PREV_TRACK', name: 'MEDIA_PREV_TRACK', standardName: '' },
  0xb2: { _nameRaw: 'VK_MEDIA_STOP', name: 'MEDIA_STOP', standardName: '' },
  0xb3: { _nameRaw: 'VK_MEDIA_PLAY_PAUSE', name: 'MEDIA_PLAY_PAUSE', standardName: '' },
  0xb4: { _nameRaw: 'VK_LAUNCH_MAIL', name: 'LAUNCH_MAIL', standardName: '' },
  0xb5: { _nameRaw: 'VK_LAUNCH_MEDIA_SELECT', name: 'LAUNCH_MEDIA_SELECT', standardName: '' },
  0xb6: { _nameRaw: 'VK_LAUNCH_APP1', name: 'LAUNCH_APP1', standardName: '' },
  0xb7: { _nameRaw: 'VK_LAUNCH_APP2', name: 'LAUNCH_APP2', standardName: '' },
  0xba: { _nameRaw: 'VK_OEM_1', name: 'OEM_1', standardName: 'SEMICOLON' },
  0xbb: { _nameRaw: 'VK_OEM_PLUS', name: 'OEM_PLUS', standardName: 'EQUALS' },
  0xbc: { _nameRaw: 'VK_OEM_COMMA', name: 'OEM_COMMA', standardName: 'COMMA' },
  0xbd: { _nameRaw: 'VK_OEM_MINUS', name: 'OEM_MINUS', standardName: 'MINUS' },
  0xbe: { _nameRaw: 'VK_OEM_PERIOD', name: 'OEM_PERIOD', standardName: 'DOT' },
  0xbf: { _nameRaw: 'VK_OEM_2', name: 'OEM_2', standardName: 'FORWARD SLASH' },
  0xc0: { _nameRaw: 'VK_OEM_3', name: 'OEM_3', standardName: 'SECTION' },
  0xdb: { _nameRaw: 'VK_OEM_4', name: 'OEM_4', standardName: 'SQUARE BRACKET OPEN' },
  0xdc: { _nameRaw: 'VK_OEM_5', name: 'OEM_5', standardName: 'BACKSLASH' },
  0xdd: { _nameRaw: 'VK_OEM_6', name: 'OEM_6', standardName: 'SQUARE BRACKET CLOSE' },
  0xde: { _nameRaw: 'VK_OEM_7', name: 'OEM_7', standardName: 'QUOTE' },
  0xdf: { _nameRaw: 'VK_OEM_8', name: 'OEM_8', standardName: '' },
  0xe2: { _nameRaw: 'VK_OEM_102', name: 'OEM_102', standardName: 'BACKTICK' },
  0xe5: { _nameRaw: 'VK_PROCESSKEY', name: 'PROCESSKEY', standardName: '' },
  0xe7: { _nameRaw: 'VK_PACKET', name: 'PACKET', standardName: '' },
  0xf6: { _nameRaw: 'VK_ATTN', name: 'ATTN', standardName: '' },
  0xf7: { _nameRaw: 'VK_CRSEL', name: 'CRSEL', standardName: '' },
  0xf8: { _nameRaw: 'VK_EXSEL', name: 'EXSEL', standardName: '' },
  0xf9: { _nameRaw: 'VK_EREOF', name: 'EREOF', standardName: '' },
  0xfa: { _nameRaw: 'VK_PLAY', name: 'PLAY', standardName: '' },
  0xfb: { _nameRaw: 'VK_ZOOM', name: 'ZOOM', standardName: '' },
  0xfc: { _nameRaw: 'VK_NONAME', name: 'NONAME', standardName: '' },
  0xfd: { _nameRaw: 'VK_PA1', name: 'PA1', standardName: '' },
  0xfe: { _nameRaw: 'VK_OEM_CLEAR', name: 'OEM_CLEAR', standardName: '' }
}

export const globalKeyListener = new EventEmitter()

export function installKeyboardListener() {
  input.install()
  input.setOnKeyUpDown(({ keyCode, isKeyDown }) => {
    const key = keyMap[keyCode] || {}
    globalKeyListener.emit('key', { isDown: isKeyDown, keyCode, ...key })
  })

  return input.uninstall
}
