import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import * as CryptoJS from 'crypto-js'
import * as _ from 'lodash'
import {ObjectId} from 'mongodb'
import {MongoRepository} from 'typeorm'
import {FindManyOptions} from 'typeorm/find-options/FindManyOptions'
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
    await this.createAdmin('admin', 'admin', [role.id.toString()])
  }

  /**
   * 根据管理员登录名查询管理员
   * @param username 管理员登录名
   */
  async findAdminByName(username: string): Promise<AdminEntity> {
    return this.adminRepository.findOne({username})
  }

  /**
   * 根据管理员id查询管理员
   * @param adminId 管理员id
   */
  async findAdminById(adminId: string): Promise<AdminEntity> {
    return this.adminRepository.findOne(adminId)
  }

  /**
   * 修改管理员信息
   * @param adminId 管理员id
   * @param data 需要修改的数据
   */
  async updateAdminById(adminId: string, data: any): Promise<void> {
    await this.adminRepository.findOneAndUpdate({_id: ObjectId(adminId)}, {$set: _.pickBy(data, _.identity)})
  }

  /**
   * 生成一个管理员
   * @param username 管理员登录名
   * @param password 管理员密码
   * @param roleId 角色id
   */
  async createAdmin(username: string, password: string, roleId: string[]): Promise<AdminEntity> {
    password = this.genAdminPassword(password)
    return this.adminRepository.save({username, password, status: 'enable', roleId, createTime: Date.now()})
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
      authority.urls = new Set((role.authority.urls || []).concat(authority.urls || []))
      authority.pages = new Set((role.authority.pages || []).concat(authority.pages || []))
      authority.components = new Set((role.authority.components || []).concat(authority.components || []))
      includeSuperRole = includeSuperRole || role.name === '超级管理员'
    }

    // 如果包含【超级管理员】，则放开所有权限
    authority = includeSuperRole ? {} : {
      urls: Array.from(authority.urls),
      pages: Array.from(authority.pages),
      components: Array.from(authority.components)
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
    } as FindManyOptions
    if (name) {
      Object.assign(query.where, {username: new RegExp(name)})
    }
    const [list, total] = await this.adminRepository.findAndCount(query)
    list.forEach(v => delete v.password)
    return {total, list}
  }

  /**
   * 生成管理员密码
   * @param password 管理员原密码
   */
  genAdminPassword(password: string): string {
    return CryptoJS.AES.encrypt(password, CryptoJS.MD5(password).toString()).toString().trim()
  }

  /**
   * 校验管理员密码
   * @param admin 管理员对象
   * @param password 输入的管理员密码
   */
  checkAdminPassword(admin: AdminEntity, password: string): boolean {
    const key = CryptoJS.MD5(password).toString()
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
