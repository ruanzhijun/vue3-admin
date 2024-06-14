import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import * as CryptoJS from 'crypto-js'
import * as _ from 'lodash'
import {ObjectId} from 'mongodb'
import {MongoRepository} from 'typeorm'
import {MongoFindManyOptions} from 'typeorm/find-options/mongodb/MongoFindManyOptions'
import {MongoFindOneOptions} from 'typeorm/find-options/mongodb/MongoFindOneOptions'
import {qqwry} from '../../common/bootstrap'
import {DatabaseType} from '../../common/constant'
import {AdminError} from '../../common/error'
import {AdminEntity} from '../entity'
import {RoleService} from './role.service'

@Injectable()
export class AdminService {
  constructor(
    private readonly roleService: RoleService,
    @InjectRepository(AdminEntity, DatabaseType.DASHBOARD)
    private readonly adminRepository: MongoRepository<AdminEntity>
  ) {
    this.init()
  }

  private async init(): Promise<void> {
    const roleList = await this.roleService.roleList(null, 1, 1)
    if (roleList.total > 0 && Array.isArray(roleList.list) && roleList.list.length > 0) {
      return
    }
    const role = await this.roleService.createRole('超级管理员')
    await this.createAdmin('admin@admin.com', '超级管理员', 'admin123', [role.id.toString()])
  }

  /**
   * 根据管理员登邮箱查询管理员
   * @param email 管理员登录邮箱
   * @param select 需要返回的字段
   */
  async findAdminByEmail(email: string, select: (keyof AdminEntity)[] = []): Promise<AdminEntity> {
    return this.adminRepository.findOne({where: {email}, select} as MongoFindOneOptions)
  }

  /**
   * 根据管理员id查询管理员
   * @param adminId 管理员id
   */
  async findAdminById(adminId: string): Promise<AdminEntity> {
    return this.adminRepository.findOneBy({_id: new ObjectId(adminId)})
  }

  /**
   * 修改管理员信息
   * @param adminId 管理员id
   * @param data 需要修改的数据
   */
  async updateAdminById(adminId: string, data: any): Promise<void> {
    await this.adminRepository.findOneAndUpdate({_id: new ObjectId(adminId)}, {$set: _.pickBy(data, _.identity)})
  }

  /**
   * 添加一个管理员
   * @param email 管理员登录邮箱
   * @param username 管理员用户名
   * @param password 管理员密码
   * @param roleId 角色id
   */
  async createAdmin(email: string, username: string, password: string, roleId: string[]): Promise<AdminEntity> {
    const createTime = Date.now()
    return this.adminRepository.save({
      email,
      username,
      password: this.genAdminPassword(password),
      status: 'enable',
      roleId,
      createTime
    })
  }

  /**
   * 获取管理员信息
   * @param admin 管理员对象
   */
  async adminInfo(admin: AdminEntity): Promise<{username: string, authority: {urls: string[], pages: string[], components: string[]}}> {
    // 查询管理员的角色，返回权限菜单
    let authority = {} as any
    let includeSuperRole = false
    for (const roleId of admin.roleId) {
      const role = await this.roleService.findRoleById(roleId)
      authority.urls = Array.from(new Set((role.authority.urls || []).concat(authority.urls || [])))
      authority.pages = Array.from(new Set((role.authority.pages || []).concat(authority.pages || [])))
      authority.components = Array.from(new Set((role.authority.components || []).concat(authority.components || [])))
      includeSuperRole = includeSuperRole || role.name === '超级管理员'
    }
    return {username: admin.username, authority}
  }

  /**
   * 管理员列表
   * @param name 管理员登录名搜索
   * @param page 当前页码
   * @param pageSize 页面大小
   */
  async adminList(name: string, page: number, pageSize: number): Promise<any> {
    const query = {
      where: {},
      order: {_id: 1},
      skip: (page - 1) * pageSize,
      take: pageSize
    } as MongoFindManyOptions
    if (name) {
      Object.assign(query.where, {username: new RegExp(name)})
    }
    const [list, total] = await this.adminRepository.findAndCount(query)
    list.forEach(v => {
      delete v.password
      if (v.lastLoginIp) {
        Object.assign(v, {lastLoginArea: qqwry.searchIP(v.lastLoginIp).Country})
      }
    })
    return {total, list}
  }

  /**
   * 生成管理员密码
   * @param email 管理员登录邮箱
   */
  genAdminPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, CryptoJS.MD5(password + password + password).toString()).toString().trim()
  }

  /**
   * 校验管理员密码
   * @param admin 管理员对象
   * @param password 输入的管理员密码
   */
  checkAdminPassword(admin: AdminEntity, password: string): boolean {
    const key = CryptoJS.MD5(password + password + password).toString()
    const serverPassword = CryptoJS.AES.decrypt(admin.password, key).toString(CryptoJS.enc.Utf8).trim()
    return serverPassword === password
  }

  /**
   * 删除管理员
   * @param admin 管理员对象
   */
  async deleteAdmin(admin: AdminEntity): Promise<void> {
    // 当系统只剩下一个可以登录账号时，不能删除
    if (admin.status === 'enable') {
      const availables = await this.adminRepository.count({status: 'enable'})
      if (availables <= 1) {
        throw AdminError.LAST_ONE_AVAILABLE
      }
    }

    await this.adminRepository.findOneAndDelete({_id: admin.id})
  }
}
