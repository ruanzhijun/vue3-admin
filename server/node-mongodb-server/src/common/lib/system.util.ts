import {INestApplication, RequestMethod} from '@nestjs/common'
import Logger from './logger.util'

export class SystemUtil {
  /**
   * 忽略的http请求方法
   */
  static excludeMethods(): string[] {
    return ['GET', 'HEAD', 'OPTIONS']
  }

  /**
   * url扫描
   * @param app 总app对象
   */
  static urlScanner(app: INestApplication): any {
    const result = {}
    const imports = Reflect.getMetadata('imports', app)
    imports.forEach(module => {
      const metadataKeys = Reflect.getMetadataKeys(module)
      if (!Array.isArray(metadataKeys) || metadataKeys.length <= 0) {
        return
      }
      const controllers = Reflect.getMetadata('controllers', module)
      for (const controller of controllers) {
        const paths = Reflect.getMetadata('path', controller)
        const func = Array.from(controller.toString().matchAll(/async.*\(/ig), x => x[0]).map(v => v.replace('async', '').replace('(', '').trim())
        func.forEach(fun => {
          const method = RequestMethod[Reflect.getMetadata('method', controller.prototype[fun])]
          let url = `${paths}${Reflect.getMetadata('path', controller.prototype[fun])}`
          url = `${(url.endsWith('/') ? url.substr(0, url.length - 1) : url).trim()}`
          if (this.excludeMethods().indexOf(method) !== -1) {
            return
          }
          const description = String(Reflect.getMetadata('description', controller.prototype[fun]) || '').trim()
          if (!description) {
            const length = 30
            Logger.error(`please define the api: ${url}'s description after request mapper decorator\r\n${'='.repeat(length)} example ${'='.repeat(length)} \r\n@Post('/login')\r\n@ApiDescription('the fucking description')\r\nasync login(@Headers() headers, @Body() body) {\r\n  // do something\r\n}\r\n${'='.repeat(length)} example ${'='.repeat(length)}`)
            process.exit(1)
          }
          result[url] = description
        })
      }
    })
    return result
  }
}
