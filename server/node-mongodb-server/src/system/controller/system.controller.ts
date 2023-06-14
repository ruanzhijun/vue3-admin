import {Controller, Get} from '@nestjs/common'
import {ApiDescription} from '../../common/decorator'
import {CaptchaService} from '../service'

/**
 * @apiDefine system 系统模块
 */
@Controller('/system')
export class SystemController {
  constructor(
    private readonly captchaService: CaptchaService
  ) {
  }

  /**
   * @api {GET} /system/captcha 获取图片验证码
   * @apiName systemCaptcha
   * @apiGroup system
   * @apiUse auth
   * @apiSampleRequest https://vue3.admin.demo.ruanzhijun.cn/api/v1/system/captcha
   * @apiSuccessExample 返回例子：
   * {
   *    "code": 0,
   *    "data": {
   *       "captcha": "data:image/png;base64,xxxxxx",    // 验证码base64字符串
   *       "uuid": "yyyyyyyyy"                           // 验证码唯一标识
   *    },
   *    "time": 1515082039984
   * }
   */
  @Get('/captcha')
  @ApiDescription('获取全局配置')
  async getCaptcha() {
    return this.captchaService.generateCaptcha()
  }
}