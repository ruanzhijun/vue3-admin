import {CanActivate, ExecutionContext} from '@nestjs/common'
import * as config from 'config'
import * as _ from 'lodash'
import {Logger} from '../lib'

/**
 * 看守器基类
 */
export abstract class BaseGuard implements CanActivate {
  /**
   * 看守器名称
   */
  protected name: string
  /**
   * 看守器配置
   */
  protected config: any

  private _initConfig(): void {
    if (this.config) {
      return
    }
    const baseConfig = _.cloneDeep(config)
    baseConfig.guard = baseConfig.guard || {}
    baseConfig.guard[this.name] = baseConfig.guard[this.name] || {enable: false}
    this.config = baseConfig.guard[this.name]
    Logger.info(`${this.name}.guard enable: ${this.config.enable}`)
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    this._initConfig()
    if (!this.config.enable) {
      return true
    }

    return this.process(context)
  }

  /**
   * 子类必须实现的逻辑
   */
  abstract process(context: ExecutionContext): Promise<boolean>
}
