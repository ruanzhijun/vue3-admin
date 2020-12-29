import {BaseError} from './base.error'

/**
 * 管理员模块错误码(20000开头)
 */
export const AdminError = {
  /**
   * 登录信息已失效，请重新登录(20001)
   */
  TOKEN_ERROR: new BaseError(20001, '登录信息已失效，请重新登录'),
  /**
   * 管理员登录密码错误(20002)
   */
  ADMIN_PASSWORD_ERROR: new BaseError(20002, '管理员登录密码错误'),
  /**
   * 您没有权限执行此操作(20003)
   */
  NO_PERMISSION: new BaseError(20003, '您没有权限执行此操作'),
  /**
   * 管理帐户不存在，请联系管理员(20004)
   */
  ADMIN_NOT_EXISTS: new BaseError(20004, '您输入的帐户不存在，请联系管理员'),
  /**
   * 角色不存在，请联系管理员(20005)
   */
  ROLE_NOT_EXISTS: new BaseError(20005, '角色不存在，请联系管理员'),
  /**
   * 超管角色不能删除(20006)
   */
  SUPER_CAN_NOT_DELETE: new BaseError(20006, '超管角色不能删除'),
  /**
   * 此角色还在绑定管理员不能删除(20008)
   */
  ROLE_CAN_NOT_DELETE: new BaseError(20008, '此角色还存在绑定管理员不能删除'),
  /**
   * 管理员重复(20009)
   */
  ADMIN_NAME_DUPLICATE: new BaseError(20009, '管理员重复'),
  /**
   * 角色名重复(20010)
   */
  ROLE_NAME_DUPLICATE: new BaseError(20010, '角色名重复'),
  /**
   * 超管角色不能编辑(20011)
   */
  SUPER_CAN_NOT_EDIT: new BaseError(20011, '超管角色不能编辑'),
  /**
   * 管理员账号被封(20012)
   */
  ACCOUNT_WAS_BANNED: new BaseError(20012, '您的帐户已被封禁，请联系管理员'),
  /**
   * 当前系统只剩下最后一个可用账号，不能删除(20013)
   */
  LAST_ONE_AVAILABLE: new BaseError(20013, '当前系统只剩下最后一个可用账号，不能删除'),
  /**
   * 不能删除自己(20014)
   */
  CAN_NOT_DELETE_MYSELF: new BaseError(20014, '不能删除自己')
}
