import {NestFactory} from '@nestjs/core'
import * as config from 'config'
import {AppModule} from './app.module'
import {ResponseAdapter} from './common/adapter'
import Bootstrap from './common/bootstrap'
import {EventType} from './common/constant'
import {DateUtil, Event, Logger} from './common/lib'

export async function bootstrap() {
  const st = DateUtil.getCurrentTimestamp()
  const options = {logger: Logger}
  const app = await NestFactory.create(AppModule, new ResponseAdapter(), options)
  app.setGlobalPrefix(config.prefix)
  await app.listen(config.port)
  Bootstrap.run()
  const exec = DateUtil.getCurrentTimestamp() - st
  const message = `${config.name} start at ${config.env} env http://127.0.0.1:${config.port} in node ${process.version}, exec：${exec} ms`
  Event.emit(EventType.SERVER_START, AppModule)
  Logger.info(message)
}

bootstrap()

export {config, Logger}
