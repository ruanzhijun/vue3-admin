import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import * as config from 'config'
import * as _ from 'lodash'
import {AdminService} from '../../account/service'
import {Logger} from '../lib'
import {JwtService} from '../../system/service'
import {AdminError} from '../error'
import {JwtGuard as BaseGuard} from './jwt.guard'

const staticWhiteList: string[] = [
  '/account/admin/info',
  '/account/admin/password'
]

/**
 * 接口权限看守器
 */
@Injectable()
export class AuthorityGuard extends BaseGuard implements CanActivate {
  name = 'authority'

  constructor(
    protected readonly jwtService: JwtService,
    protected readonly adminService: AdminService
  ) {
    super(jwtService)
  }

  /**
   * 看守器业务逻辑
   */
  async process(context: ExecutionContext): Promise<boolean> {
    const authorityWhiteList = (this.config.whitelist || []).concat(...staticWhiteList)
    const ctx = context.getArgByIndex(0)
    const url = ctx.path.replace(config.prefix, '')
    if (this.canIgnoreCheck(url, authorityWhiteList)) {
      return true
    }
    await this.decrypt(ctx, url)
    const {adminId} = ctx.headers
    if (!adminId) {
      Logger.warn(`token解析不到adminId，token异常，强制退出！url：${url}，adminId：${adminId}`)
      throw AdminError.TOKEN_ERROR
    }

    // 验证管理员是否合法
    const admin = await this.adminService.findAdminById(adminId)
    if (!admin) {
      Logger.warn(`token解析得到的adminId无法获取管理员，强制退出！url：${url}，adminId：${adminId}`)
      throw AdminError.TOKEN_ERROR
    }

    // 验证是否被封号
    if (admin.status !== 'enable') {
      Logger.warn(`当前管理员账号被封，强制退出！url：${url}，adminId：${adminId}`)
      throw AdminError.TOKEN_ERROR
    }

    // 获取权限
    const adminInfo = await this.adminService.adminInfo(admin)
    const authority = adminInfo.authority.urls || []
    Logger.trace(`管理员 ${adminId} 的权限列表：${JSON.stringify(authority)}`)

    // 如果是超管，所有请求都通过
    if (_.isEqual(authority, [])) {
      return true
    }

    // 普通管理员需要验证权限
    for (const checkUrl of authority.concat(...authorityWhiteList)) {
      if (url.startsWith(checkUrl)) {
        return true
      }
    }
    Logger.warn(`管理员 ${adminId} 权限不足！url：${url}，ta的权限列表：${JSON.stringify(authority)}`)
    throw AdminError.NO_PERMISSION
  }
}
