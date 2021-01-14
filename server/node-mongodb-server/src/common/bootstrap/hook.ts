import {Logger} from '../lib'

process.on('SIGTERM', () => {
  Logger.info('on SIGTERM | server is down ...')
  process.exit(0)
})

process.on('SIGINT', async () => {
  Logger.info('on SIGINT | server is down ...')
  process.exit(0)
})

process.on('uncaughtException', err => {
  Logger.error('未知错误', err)
})

export default {process}
