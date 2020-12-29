import * as fs from 'fs'
import {Logger} from '../lib'

export * from './tracer'
export * from './bluebird'
export * from './hook'

class Bootstrap {
  run() {
    const filter = ['index.ts', 'index.js']
    let bootstraps = fs.readdirSync(__dirname)
    bootstraps = bootstraps.filter(v => filter.indexOf(v) === -1)
    bootstraps = bootstraps.map(v => v.replace('.js', ''))
    bootstraps = bootstraps.map(v => v.replace('.ts', ''))
    bootstraps.forEach(v => Logger.info(`load bootstrap ${v}`))
  }
}

export default new Bootstrap()
