import {Controller, Get, Query} from '@nestjs/common'
import 'reflect-metadata'
import {DatePattern} from '../../common/constant'
import {ApiDescription} from '../../common/decorator'
import {SystemError} from '../../common/error'
import {PaginationSchema} from '../../common/joi'
import {DateUtil, joi, joiValidate} from '../../common/lib'
import {LogService} from '../service'

/**
 * @apiDefine system 系统模块
 */
@Controller('/system')
export class LogController {
  constructor(
    private readonly logService: LogService
  ) {
  }

  /**
   * @api {GET} /system/urls 所有管理接口
   * @apiName systemUrls
   * @apiGroup system
   * @apiUse auth
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/system/urls
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *        "/account/admin/login": "管理员登录",
   *        "/account/admin/password": "管理员修改密码"
   *        ......
   *    },
   *    "time": 1515082039984
   * }
   */
  @Get('/urls')
  @ApiDescription('所有管理接口')
  async urls() {
    return this.logService.getUrls()
  }

  /**
   * @api {GET} /system/log 管理员操作日志
   * @apiName systemlog
   * @apiGroup system
   * @apiUse auth
   * @apiUse pagination
   * @apiParam {String} [name] 管理员登录名搜索
   * @apiParam {String} [startDate=当月第一天] 开始时间(格式：YYYY-MM-DD)
   * @apiParam {String} [endDate=当月最后一天] 结束时间(格式：YYYY-MM-DD)
   * @apiParam {String} [action] 指定动作
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/system/log
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *       "total": 100,
   *       "list": [{
   *          "id": "5d0cf5c869903f4c8845ed7e",       // 角色id
   *          "name": "超级管理员",                    // 角色名称
   *          "relations": 1,                         // 关联管理员人数
   *          "authority": [....],                    // 权限列表
   *          "createTime": 1561130440760             // 角色创建时间
   *       }, {...}]
   *    },
   *    "time": 1515082039984
   * }
   */
  @Get('/log')
  @ApiDescription('管理员操作日志')
  async logList(@Query() query) {
    const {name, startDate, endDate, action, page, pageSize} = joiValidate(query, {
      name: joi.string().trim().strict().trim().error(SystemError.PARAMS_ERROR('管理员登录名不能为空')),
      startDate: joi.string().trim().regex(DatePattern).strict().trim().default(DateUtil.formatTime(new Date(Date.parse(`${DateUtil.str2dateStr(DateUtil.getMonth(), 'YYYY-MM')}-01 00:00:00`)), 'YYYY-MM-DD')).error(SystemError.PARAMS_ERROR('搜索开始时间格式不正确')),
      endDate: joi.string().trim().regex(DatePattern).strict().trim().default(DateUtil.formatTime(new Date(Date.parse(`${DateUtil.str2dateStr(DateUtil.getMonth(1), 'YYYY-MM')}-01 00:00:00`) - 1), 'YYYY-MM-DD')).error(SystemError.PARAMS_ERROR('搜索结束时间格式不正确')),
      action: joi.array().unique().items(joi.string().strict().valid(...Object.keys(this.logService.getUrls()))).error(SystemError.PARAMS_ERROR('指定动作参数错误')),
      ...PaginationSchema
    })

    if ((startDate && !endDate) || (!startDate && endDate)) {
      throw SystemError.PARAMS_ERROR('时间必需成对出现')
    }

    const startTime = Date.parse(`${startDate} 00:00:00.000`)
    const endTime = Date.parse(`${endDate} 23:59:59.999`)
    if (startTime > endTime) {
      throw SystemError.PARAMS_ERROR('开始时间不能大于结束时间')
    }

    if (DateUtil.formatTime(new Date(startTime), 'YYYYMM') !== DateUtil.formatTime(new Date(endTime), 'YYYYMM')) {
      throw SystemError.PARAMS_ERROR('不支持夸月份查询')
    }

    return this.logService.logList(name, startTime, endTime, action, page, pageSize)
  }
}
