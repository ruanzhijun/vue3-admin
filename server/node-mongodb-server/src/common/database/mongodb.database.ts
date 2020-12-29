import {TypeOrmModule} from '@nestjs/typeorm'
import * as config from 'config'
import * as fs from 'fs'
import * as path from 'path'
import {DatabaseType} from '../constant'
import {Logger} from '../lib'

const {dbs} = config.mongodb

function getEntities(db: {name: string}): string[] {
  const basePath = path.resolve(`${__dirname}/../../`)
  const filter = ['app.module.ts', 'app.module.js', 'apidoc.ts', 'apidoc.js', 'common', 'main.ts', 'main.js']
  const modules = fs.readdirSync(basePath).filter(v => filter.indexOf(v) === -1)
  if (db.name === DatabaseType.APP) {
    return [`${basePath}/v5/entity/*.entity{.ts,.js}`]
  }
  return modules.filter(v => v !== 'v5').map(m => `${basePath}/${m}/entity/*.entity{.ts,.js}`)
}

export const MongodbDatabase = dbs.map(db => TypeOrmModule.forRoot({
  type: 'mongodb',
  url: db.url,
  name: db.name,
  synchronize: true,
  loggerLevel: 'info',
  entities: getEntities(db)
}))
Logger.info('Mongodb Init Finish...')
