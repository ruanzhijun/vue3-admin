import {TypeOrmModule} from '@nestjs/typeorm'
import * as Bluebird from 'bluebird'
import * as config from 'config'
import * as fs from 'fs'
import * as _ from 'lodash'
import {MongoClient} from 'mongodb'
import * as path from 'path'
import {DatabaseType} from '../constant'
import {Logger} from '../lib'

let database = null
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

function dbName(url: string): string {
  const lastIndexSlash = url.lastIndexOf('/') + 1
  const lastIndexFactor = url.lastIndexOf('?')
  if (lastIndexFactor > 0) {
    return url.substring(lastIndexSlash, lastIndexFactor).trim()
  }
  return url.substr(lastIndexSlash).trim()
}

MongoClient.connect(config.logdb.url, (err, client) => {
  if (_.isEmpty(err)) {
    Logger.info(`connect to mongodb：${config.logdb.url} success...`)
  } else {
    Logger.error(`connect to mongodb：${config.logdb.url} error:`, err)
  }

  database = client.db(dbName(config.logdb.url))
})

class Mongodb {
  private readonly collection

  constructor(month: number = 0) {
    const collectionName = `Log_${month}`
    Logger.info(`当前 collectionName：${collectionName}`)
    this.collection = database.collection(collectionName)
  }

  /**
   * 获取当前所有表
   */
  async collections(): Promise<string[]> {
    return (await database.collections()).map(v => v.collectionName)
  }

  /**
   * find方法(参数参考：http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find)
   * @param query 查询条件
   * @param options 查询选项
   */
  async find(query?, options?) {
    return new Bluebird((resolve, reject) => {
      this.collection.find(query, options).toArray((err, items) => {
        if (err) {
          reject(err)
          return
        }
        resolve(items)
      })
    }).catch(e => {
      Logger.error(e)
    })
  }

  /**
   * findOne方法(参数参考：http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne)
   * @param query 查询条件
   * @param options 查询选项
   */
  async findOne(query?, options?): Promise<any> {
    return this.collection.findOne(query, options)
  }

  /**
   * count方法(参数参考：http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#countDocuments)
   * @param query 查询条件
   * @param options 查询选项
   */
  async count(query?, options?): Promise<number> {
    return this.collection.countDocuments(query, options)
  }

  /**
   * drop方法(参数参考：http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#drop)
   */
  async drop(): Promise<void> {
    const collections = await this.collections()
    if (collections.indexOf(this.collection.collectionName) === -1) {
      return
    }
    this.collection.drop()
  }

  /**
   * aggregate方法(参数参考：http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#aggregate)
   * @param pipeline 管道查询条件
   * @param options 查询选项
   */
  async aggregate(pipeline?, options?) {
    return new Bluebird((resolve, reject) => {
      this.collection.aggregate(pipeline, options).toArray((err, items) => {
        if (err) {
          reject(err)
          return
        }
        resolve(items)
      })
    }).catch(e => {
      Logger.error(e)
    })
  }
}

/**
 * 获取log的数据实体
 * @param month 是否加减月份
 */
export function getLogRepository(month: number): Mongodb {
  return new Mongodb(month)
}

Logger.info('Mongodb Init Finish...')
