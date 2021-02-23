import {INestApplication, Injectable} from '@nestjs/common'
import * as config from 'config'
import * as _ from 'lodash'
import {AdminService} from '../../account/service'
import {qqwry} from '../../common/bootstrap'
import {EventType} from '../../common/constant'
import {getLogRepository} from '../../common/database'
import {DateUtil, Event, SystemUtil} from '../../common/lib'

@Injectable()
export class LogService {
  private urls: any

  constructor(
    private readonly adminService: AdminService
  ) {
    const that = this
    Event.on(EventType.SERVER_START, (app: INestApplication) => {
      that.urls = SystemUtil.urlScanner(app)
    })
  }

  /**
   * 返回所有url
   */
  getUrls(): any {
    return this.urls
  }

  /**
   * 操作日志
   * @param name 管理员登录名搜索
   * @param startTime 开始时间戳
   * @param endTime 结束时间戳
   * @param action 指定动作
   * @param page 当前页码
   * @param pageSize 页面大小
   */
  async logList(name: string, startTime: number, endTime: number, action: string, page: number, pageSize: number): Promise<any> {
    // 计算应该获取哪一个月的数据实例
    const db = getLogRepository(parseInt(DateUtil.formatTime(new Date(startTime), 'YYYYMM')))

    // 构造查询条件
    const urls = Object.keys(this.urls).map(v => `${config.prefix}${v}`)
    const query = {url: {$in: urls}, method: {$nin: SystemUtil.excludeMethods()}}
    if (name) {
      const users = await this.adminService.findAdminByName(name, ['id'])
      Object.assign(query, {'headers.adminId': {$in: users.map(v => v.id.toString())}})
    }
    if (Array.isArray(action) && action.length > 0) {
      Object.assign(query, {url: {$in: action.map(v => `${config.prefix}${v}`)}})
    }
    if (startTime && endTime) {
      Object.assign(query, {requestTime: {$gte: startTime, $lte: endTime}})
    }

    const list = []
    const adminCache = {}
    const options = {sort: [['_id', -1]], skip: (page - 1) * pageSize, limit: pageSize}
    const [total, result] = await Promise.all([db.count(query), db.find(query, options)])
    for (const data of result as any[]) {
      let admin = adminCache[data.headers.adminId]
      if (!admin) {
        admin = await this.adminService.findAdminById(data.headers.adminId)
        adminCache[data.headers.adminId] = admin
      }
      const ip = _.head(_.toString(data.headers['x-forwarded-for'] || data.headers['x-real-ip']).trim().split(',')).trim() || null
      list.push({
        name: admin && admin.username ? admin.username : '未知管理员',
        action: this.urls[data.url.replace(config.prefix, '')],
        result: data.response.code === 0 ? '成功' : '失败',
        message: data.response.code === 0 ? null : data.response.message,
        ip,
        ipArea: ip ? qqwry.searchIP(ip).Country : null,
        requestTime: data.requestTime
      })
    }
    return {total, list}
  }
}
