import {HttpUtil} from '../util'

export class SystemApi {
  /**
   * 获取全局配置
   */
  static async getGlobalConfig(): Promise<{module: string, config: {id: string, module: string, key: string, value: string, desc: string}[]}[]> {
    return HttpUtil.get('/system/global/config')
  }

  /**
   * 新增全局配置
   * @param config 配置数据
   * @param config.module 模块
   * @param config.key 配置key
   * @param config.value 配置数值
   * @param config.desc 配置说明
   */
  static async saveGlobalConfig(config: {module: string, key: string, value: string, desc: string}): Promise<number> {
    return HttpUtil.post('/system/global/config/save', config)
  }

  /**
   * 修改全局配置
   * @param id 配置id
   * @param config 配置数据
   * @param config.value 配置数值
   * @param config.desc 配置说明
   */
  static async updateGlobalConfig(id: string, config: {value: string, desc: string}): Promise<number> {
    return HttpUtil.post('/system/global/config/update', Object.assign({id}, config))
  }

  /**
   * 删除全局配置
   * @param id 配置id
   */
  static async deleteGlobalConfig(id: string): Promise<number> {
    return HttpUtil.post('/system/global/config/delete', {id})
  }
}
