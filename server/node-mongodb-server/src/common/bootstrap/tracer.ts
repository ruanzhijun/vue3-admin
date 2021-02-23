import * as config from 'config'
import {ShareTracer, ShareTracerOptions} from 'share-tracer'
import {Logger} from '../lib'

const options = {
  mongodb: {
    enable: !!(config.logdb && config.logdb.url),
    url: config.logdb && config.logdb.url ? config.logdb.url : ''
  },
  logger: {
    enable: true,
    instance: Logger
  },
  indexes: [
    {url: -1},
    {'headers.adminId': -1}
  ]
} as ShareTracerOptions

export default new ShareTracer(options).run()
