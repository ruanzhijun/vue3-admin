/**
 * 约定错误码定义规范：按模块分，每个模块占用一个号码段，从10000，理论上一个模块可以定义9999的错误
 */
// 系统模块误码(10000)
export {SystemError} from './system.error'

// 管理员模块误码(20000)
export {AdminError} from './admin.error'
