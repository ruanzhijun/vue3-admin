import {HttpUtil} from '../util'

export class SystemApi {
  /**
   * 获取图片验证码
   */
  static async getCaptcha(): Promise<{captcha: string, uuid: string}> {
    return HttpUtil.get('/system/captcha')
  }

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
    return HttpUtil.post('/system/global/config/update', {id, ...config})
  }

  /**
   * 删除全局配置
   * @param id 配置id
   */
  static async deleteGlobalConfig(id: string): Promise<number> {
    return HttpUtil.post('/system/global/config/delete', {id})
  }

  /**
   * 所有管理接口
   */
  static async getUrls(): Promise<any> {
    return HttpUtil.get('/system/urls')
  }

  /**
   * 获取管理员操作日志
   * @param page 当前页码
   * @param pageSize 页面大小
   * @param name 管理员登录名搜索
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param action 指定动作
   */
  static async getLogList(page: number, pageSize: number, name?: string, startDate?: string, endDate?: string, action?: string[]): Promise<any> {
    return HttpUtil.get('/system/log', {page, pageSize, name, startDate, endDate, 'action[]': action})
  }
}
