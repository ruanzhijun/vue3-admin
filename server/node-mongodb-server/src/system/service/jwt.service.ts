import {Injectable} from '@nestjs/common'
import * as config from 'config'
import * as fs from 'fs'
import * as jwt from 'jsonwebtoken'
import {AdminError} from '../../common/error'
import {Logger} from '../../common/lib'

@Injectable()
export class JwtService {
  private readonly publicKey: string
  private readonly privateKey: string
  private readonly algorithm: string = 'RS256'
  private readonly expiresIn: string = '12h'

  constructor() {
    const {appDir} = config
    this.publicKey = fs.readFileSync(`${appDir}/cert/rsa_public_key.pem`, 'utf-8').trim()
    this.privateKey = fs.readFileSync(`${appDir}/cert/pkcs8_rsa_private_key.pem`, 'utf-8').trim()
    Logger.info('jwt init success ...')
  }

  /**
   * jwt加密
   * @param data 要加密的数据
   * @param options 选项
   */
  async encrypt(data: object, options?: jwt.SignOptions): Promise<string> {
    Object.assign(data, {env: config.env})
    return jwt.sign(data, this.privateKey, options || {
      algorithm: options.algorithm || this.algorithm,
      expiresIn: options.expiresIn || this.expiresIn
    })
  }

  /**
   * jwt解密
   * @param data 待解密数据
   */
  async decrypt(data: string): Promise<any> {
    try {
      const result: {iat?: any, exp?: any, env?: any} = jwt.verify(data, this.publicKey) as {iat?: any, exp?: any, env?: any}

      // 防止不同环境的token混用，造成不必要的错误
      if (result.env !== config.env) {
        Logger.warn(`token环境不正确，server：${config.env}，client：${result.env}`)
        throw AdminError.TOKEN_ERROR
      }
      delete result.iat
      delete result.exp
      delete result.env
      return result
    } catch (e) {
      Logger.error('jwt decrypt error: ', data, e)
      return null
    }
  }
}
