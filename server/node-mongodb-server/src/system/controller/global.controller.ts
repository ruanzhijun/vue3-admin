import {Body, Controller, Get, Post} from '@nestjs/common'
import * as _ from 'lodash'
import {SystemError} from '../../common/error'
import {joi, joiValidate} from '../../common/lib'
import {SystemService} from '../../v5/service'

/**
 * @apiDefine system 系统模块
 */
@Controller('/system')
export class GlobalController {
  constructor(
    private readonly systemService: SystemService
  ) {
  }

  /**
   * @api {GET} /system/global/config 获取全局配置
   * @apiName systemGetGlobalConfig
   * @apiGroup system
   * @apiUse auth
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/system/global/config
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": [{
   *      "module": "运营配置",                // 模块名称(页面显示用)
   *      "config": [{
   *         "id": "5f60c47dd10f1c4cf8539374",// 配置id
   *         "key": "inviteCommission",       // 配置key
   *         "value": "0.0001",               // 配置内容
   *         "desc": "邀请注册奖励"            // 配置描述(页面显示用)
   *      }, {...}]
   *    }, {...}],
   *    "time": 1515082039984
   * }
   */
  @Get('/global/config')
  async getGlobalConfig() {
    return this.systemService.getGlobalConfig()
  }

  /**
   * @api {POST} /system/global/config/save 保存全局配置
   * @apiName systemSaveGlobalConfig
   * @apiGroup system
   * @apiUse auth
   * @apiParam {String} module 模块
   * @apiParam {String} key 配置key
   * @apiParam {String} value 配置数值
   * @apiParam {String} desc 配置说明
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/system/global/config/save
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,             // 保存成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/global/config/save')
  async saveGlobalConfig(@Body() body) {
    const keyErrorMessage = '配置KEY的格式必需只能含有数字、大写字母、_，且_不能在开头'
    const {module, key, value, desc} = joiValidate(body, {
      module: joi.string().trim().required().strict().error(SystemError.PARAMS_ERROR('请传入模块')),
      key: joi.string().trim().regex(/^[0-9A-Z_]+$/).strict().required().error(SystemError.PARAMS_ERROR(keyErrorMessage)),
      value: joi.string().trim().required().strict().error(SystemError.PARAMS_ERROR('请输入配置数值')),
      desc: joi.string().trim().required().strict().error(SystemError.PARAMS_ERROR('请输入配置说明'))
    })

    if (key.startsWith('_')) {
      throw SystemError.PARAMS_ERROR(keyErrorMessage)
    }

    const config = await this.systemService.getGlobalConfig(key)
    if (!_.isEmpty(config)) {
      throw SystemError.CONFIG_DUPLICATE
    }

    await this.systemService.saveGlobalConfig(module, key, value, desc)
    return 1
  }

  /**
   * @api {POST} /system/global/config/update 修改全局配置
   * @apiName systemUpdateGlobalConfig
   * @apiGroup system
   * @apiUse auth
   * @apiParam {String} id 配置id
   * @apiParam {String} value 配置数值
   * @apiParam {String} desc 配置说明
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/system/global/config/update
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,             // 修改成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/global/config/update')
  async updateGlobalConfig(@Body() body) {
    const {id, value, desc} = joiValidate(body, {
      id: joi.string().length(24).required().strict().error(SystemError.PARAMS_ERROR('请传入正确的配置id')),
      value: joi.string().trim().strict().error(SystemError.PARAMS_ERROR('请输入配置值')),
      desc: joi.string().trim().strict().error(SystemError.PARAMS_ERROR('请输入配置说明'))
    })

    if (_.isEmpty(value) && _.isEmpty(desc)) {
      throw SystemError.AT_LEAST_ONE
    }

    await this.systemService.updateGlobalConfig(id, value, desc)
    return 1
  }

  /**
   * @api {POST} /system/global/config/delete 删除全局配置
   * @apiName systemDeleteGlobalConfig
   * @apiGroup system
   * @apiUse auth
   * @apiParam {String} id 配置id
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/system/global/config/delete
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": 1,             // 删除成功返回1
   *    "time": 1515082039984
   * }
   */
  @Post('/global/config/:id')
  async deleteGlobalConfig(@Body() body) {
    const {id} = joiValidate(body, {id: joi.string().length(24).required().strict().error(SystemError.PARAMS_ERROR('请传入正确的配置id'))})

    await this.systemService.deleteGlobalConfig(id)
    return 1
  }
}
