import {HttpUtil} from '../util'

export class AccountApi {
  /**
   * 登录
   * @param email 登录邮箱
   * @param password 登录密码
   */
  static async login(email: string, password: string): Promise<{token: string, username: string, authority: {urls: string[], pages: string[], components: string[]}}> {
    return HttpUtil.post('/account/admin/login', {email, password})
  }

  /**
   * 管理员信息
   */
  static async adminInfo(): Promise<{username: string, authority: {urls: string[], pages: string[], components: string[]}}> {
    return HttpUtil.get('/account/admin/info')
  }

  /**
   * 所有角色
   */
  static async getAllRole(): Promise<{id: string, name: string}[]> {
    return HttpUtil.get('/account/role/all')
  }

  /**
   * 角色列表
   * @param page 当前页码
   * @param pageSize 页面大小
   * @param name 角色名搜索
   */
  static async getRoleList(page: number, pageSize: number, name?: string): Promise<{total: number, list: any[]}> {
    return HttpUtil.get('/account/role/list', {page, pageSize, name})
  }

  /**
   * 添加角色
   * @param name 角色名
   * @param authority 角色权限
   */
  static async addRole(name: string, authority: any): Promise<number> {
    return HttpUtil.post('/account/role/add', {name, authority})
  }

  /**
   * 编辑角色
   * @param roleId 角色id
   * @param name 角色名
   * @param authority 角色权限
   */
  static async editRole(roleId: string, name: string, authority: any): Promise<number> {
    return HttpUtil.post('/account/role/edit', {roleId, name, authority})
  }

  /**
   * 删除角色
   * @param roleId 角色id
   */
  static async deleteRole(roleId: string): Promise<number> {
    return HttpUtil.post('/account/role/delete', {roleId})
  }

  /**
   * 管理员列表
   * @param page 当前页码
   * @param pageSize 页面大小
   * @param name 管理员登录名搜索
   */
  static async getAdminList(page?: number, pageSize?: number, name?: string): Promise<{total: number, list: any[]}> {
    return HttpUtil.get('/account/admin/list', {page, pageSize, name})
  }

  /**
   * 管理员详情
   * @param adminId 管理员id
   */
  static async getAdminDetail(adminId: string): Promise<{id: string, email: string, username: string, status: string, createTime: number, lastLoginTime: number, roleNames: string[], roleId: string[]}> {
    return HttpUtil.get('/account/admin/detail', {adminId})
  }

  /**
   * 添加管理员
   * @param username 管理员登录名
   * @param password 管理员登录密码
   * @param roleId 角色id
   */
  static async addAdmin(username: string, password: string, roleId: string[]): Promise<number> {
    return HttpUtil.post('/account/admin/add', {username, password, roleId})
  }

  /**
   * 编辑管理员
   * @param adminId 管理员id
   * @param username 管理员登录名
   * @param password 管理员登录密码
   * @param roleId 角色id
   * @param status 状态
   */
  static async editAdmin(adminId: string, username: string, password: string, roleId: string[], status: string): Promise<number> {
    return HttpUtil.post('/account/admin/edit', {adminId, username, password, roleId, status})
  }

  /**
   * 管理员修改自己的密码
   * @param password 管理员登录密码
   */
  static async modifyMyPassword(password: string): Promise<number> {
    return HttpUtil.post('/account/admin/password', {password})
  }

  /**
   * 删除管理员
   * @param adminId 管理员id
   */
  static async deleteAdmin(adminId: string): Promise<number> {
    return HttpUtil.post('/account/admin/delete', {adminId})
  }
}
