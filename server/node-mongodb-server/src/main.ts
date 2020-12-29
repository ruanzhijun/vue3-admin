import {NestFactory} from '@nestjs/core'
import * as config from 'config'
import {AppModule} from './app.module'
import {V5Adapter} from './common/adapter'
import Bootstrap from './common/bootstrap'
import {DateUtil, Logger} from './common/lib'

export async function bootstrap() {
  const st = DateUtil.getCurrentTimestamp()
  const options = {logger: Logger}
  const app = await NestFactory.create(AppModule, new V5Adapter(), options)
  app.setGlobalPrefix(config.prefix)
  await app.listenAsync(config.port)
  Bootstrap.run()
  const exec = DateUtil.getCurrentTimestamp() - st
  const message = `${config.name} start at ${config.env} env http://127.0.0.1:${config.port}, exec：${exec} ms`
  Logger.info(message)
}

bootstrap()

export {config, Logger}
