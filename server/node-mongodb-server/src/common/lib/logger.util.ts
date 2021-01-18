import {LoggerService} from '@nestjs/common'
import * as config from 'config'
import * as log4js from 'log4js'
import * as path from 'path'

export class Logger implements LoggerService {
  constructor(options?: any) {
    log4js.configure(options || config.get('log4js'))
    this._init()
  }

  log(message: any, ...args: any[]) {
    log4js.getLogger(this._category()).info(message, ...args)
  }

  info(message: any, ...args: any[]) {
    log4js.getLogger(this._category()).info(message, ...args)
  }

  error(message: any, ...args: any[]) {
    log4js.getLogger(this._category()).error(message, ...args)
  }

  trace(message: any, ...args: any[]) {
    log4js.getLogger(this._category()).trace(message, ...args)
  }

  warn(message: any, ...args: any[]) {
    log4js.getLogger(this._category()).warn(message, ...args)
  }

  private _init() {
    // 把console绑定到logger
    const logger = log4js.getLogger('unico.admin.logger')
    console.log = logger.trace.bind(logger)
    console.warn = logger.warn.bind(logger)
    console.error = logger.error.bind(logger)
  }

  private _category() {
    let category = new Error().stack.split('\n')[3]
    const stack = category.split(' ').filter(v => !!v)
    const arr = stack[stack.length - 1].split(path.sep)
    category = arr[arr.length - 1]
    category = category.substring(0, category.length - 1)
    category = `${category} (${stack[1]})`
    return category
  }
}

export default new Logger()
