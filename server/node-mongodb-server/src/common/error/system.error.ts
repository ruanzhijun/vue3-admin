import {BaseError} from './base.error'

/**
 * 系统模块错误码(10000开头)
 */
export const SystemError = {
  /**
   * 服务器开了个小差，请稍后重试(10001)
   */
  SYSTEM_ERROR: new BaseError(10001, '服务器开了个小差，请稍后重试'),
  /**
   * 请求参数错误(10002)
   */
  PARAMS_ERROR: message => new BaseError(10002, message),
  /**
   * 请不要添加重复的配置KEY(10003)
   */
  CONFIG_DUPLICATE: new BaseError(10003, '请不要添加重复的配置KEY'),
  /**
   * 至少需要传入一个参数(10004)
   */
  AT_LEAST_ONE: new BaseError(10004, '请至少需要传入一个参数')
}
