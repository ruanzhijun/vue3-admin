import {Injectable} from '@nestjs/common'
import {Captcha} from 'captcha.gif'
import {MemoryCache} from 'memory-cache-node'
import {v4} from 'uuid'

@Injectable()
export class CaptchaService {
  private memoryCache = new MemoryCache<string, string>(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)

  /**
   * 生成图片验证码
   */
  generateCaptcha(): {captcha: string, uuid: string} {
    const captcha = new Captcha()
    const {token, buffer} = captcha.generate(4)
    const string = Buffer.from(buffer).toString('base64')
    const uuid = v4()
    this.memoryCache.storePermanentItem(uuid, token)
    return {captcha: string, uuid}
  }

  /**
   * 验证图片验证码
   * @param uuid 验证码唯一标识
   * @param input 输入的验证码
   */
  varifyCaptcha(uuid: string, input: string): boolean {
    const hasItem = this.memoryCache.hasItem(uuid)
    this.memoryCache.removeItem(uuid)
    return hasItem && this.memoryCache.retrieveItemValue(uuid) === input
  }
}
