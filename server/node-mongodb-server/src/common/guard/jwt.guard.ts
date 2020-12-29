import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import * as config from 'config'
import {JwtService} from '../../system/service'
import {AdminError} from '../error'
import {Logger, joi, joiValidate} from '../lib'
import {BaseGuard} from './base.guard'

/**
 * jwt鉴权看守器
 */
@Injectable()
export class JwtGuard extends BaseGuard implements CanActivate {
  name = 'jwt'

  constructor(
    protected readonly jwtService: JwtService
  ) {
    super()
  }

  /**
   * 看守器业务逻辑
   */
  async process(context: ExecutionContext): Promise<boolean> {
    const jwtWhiteList = this.config.whitelist || []
    const ctx = context.getArgByIndex(0)
    const url = ctx.path.replace(config.prefix, '')
    if (this.canIgnoreCheck(url, jwtWhiteList)) {
      return true
    }

    return this.decrypt(ctx, url)
  }

  protected canIgnoreCheck(url, jwtWhiteList): boolean {
    for (const checkUrl of jwtWhiteList) {
      if (url === checkUrl) {
        return true
      }
    }
    return false
  }

  protected async decrypt(ctx, url): Promise<boolean> {
    const {token} = joiValidate({token: ctx.headers.token || ctx.query.token}, {
      token: joi.string().trim().min(64).required().strict().error(AdminError.TOKEN_ERROR)
    })
    const decryptData = await this.jwtService.decrypt(token)
    if (!decryptData) {
      Logger.warn(`用户token解析失败，token：${token}, url：${url}`)
      throw AdminError.TOKEN_ERROR
    }

    Object.assign(ctx.headers, decryptData)
    return true
  }
}
