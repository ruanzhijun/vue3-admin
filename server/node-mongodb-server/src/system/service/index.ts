import {CaptchaService} from './captcha.service'
import {JwtService} from './jwt.service'
import {LogService} from './log.service'

export const Service = [
  JwtService,
  LogService,
  CaptchaService
]

export {JwtService, LogService, CaptchaService}
