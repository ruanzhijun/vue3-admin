import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import * as _ from 'lodash'
import {ObjectId} from 'mongodb'
import {MongoRepository} from 'typeorm'
import {DatabaseType} from '../../common/constant'
import {SystemConfigEntity} from '../entity'

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemConfigEntity, DatabaseType.APP)
    private readonly systemConfigRepository: MongoRepository<SystemConfigEntity>
  ) {
  }

  /**
   * 获取全局配置
   * @param key 配置key
   */
  async getGlobalConfig(key?: string): Promise<any[]> {
    const globalConfig = await this.systemConfigRepository.find(_.pickBy({key}, _.identity))
    const result = {}
    globalConfig.forEach(value => Object.assign(result, {[value.module]: {module: value.module, config: []}}))
    globalConfig.forEach(value => result[value.module].config.push(value))

    // 按照模块名自然排序
    return Object.values(result).sort((a, b) => _.get(b, 'module').localeCompare(_.get(a, 'module')))
  }

  /**
   * 保存全局配置
   * @param module 模块
   * @param key 配置key
   * @param value 配置值
   * @param desc 配置说明
   */
  async saveGlobalConfig(module: string, key: string, value: string, desc: string): Promise<void> {
    await this.systemConfigRepository.save({module, key, value, desc})
  }

  /**
   * 修改全局配置
   * @param id 配置id
   * @param value 配置值
   * @param desc 配置说明
   */
  async updateGlobalConfig(id: string, value: string, desc: string): Promise<void> {
    await this.systemConfigRepository.findOneAndUpdate({_id: ObjectId(id)}, {$set: _.pickBy({value, desc}, _.identity)})
  }

  /**
   * 删除全局配置
   * @param id 配置id
   */
  async deleteGlobalConfig(id: string): Promise<void> {
    await this.systemConfigRepository.findOneAndDelete({_id: ObjectId(id)})
  }
}
