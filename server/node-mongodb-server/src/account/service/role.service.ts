import {Injectable} from '@nestjs/common'
import {InjectRepository} from '@nestjs/typeorm'
import * as _ from 'lodash'
import {ObjectId} from 'mongodb'
import {MongoRepository} from 'typeorm'
import {MongoFindManyOptions} from 'typeorm/find-options/mongodb/MongoFindManyOptions'
import {DatabaseType} from '../../common/constant'
import {AdminError} from '../../common/error'
import {AdminEntity, RoleEntity} from '../entity'

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity, DatabaseType.DASHBOARD)
    private readonly roleRepository: MongoRepository<RoleEntity>,
    @InjectRepository(AdminEntity, DatabaseType.DASHBOARD)
    private readonly adminRepository: MongoRepository<AdminEntity>
  ) {
  }

  /**
   * 生成一个角色
   * @param name 角色名
   * @param authority 角色可以访问的菜单、按钮
   */
  async createRole(name: string, authority: any = {}): Promise<RoleEntity> {
    return this.roleRepository.save({name, authority, createTime: Date.now()})
  }

  /**
   * 根据角色id查询角色
   * @param roleId 角色id
   */
  async findRoleById(roleId: string): Promise<RoleEntity> {
    return this.roleRepository.findOneBy({_id: new ObjectId(roleId)})
  }

  /**
   * 根据角色名查询角色
   * @param name 角色名
   */
  async findRoleByName(name: string): Promise<RoleEntity> {
    return this.roleRepository.findOneBy({name})
  }

  /**
   * 角色列表
   * @param name 角色名搜索
   * @param page 当前页码
   * @param pageSize 页面大小
   */
  async roleList(name: string, page: number, pageSize: number): Promise<any> {
    const query = {
      where: {},
      order: {_id: 1},
      skip: (page - 1) * pageSize,
      take: pageSize
    } as MongoFindManyOptions
    if (name) {
      Object.assign(query.where, {name: new RegExp(name)})
    }
    const [list, total] = await this.roleRepository.findAndCount(query)
    for (const role of list) {
      Object.assign(role, {relations: await this.countByRoleId(role.id.toString())})
    }
    return {total, list}
  }

  /**
   * 编辑角色
   * @param roleId 角色id
   * @param name 角色名
   * @param authority 角色可以访问的菜单
   */
  async editRole(roleId: string, name: string, authority: any): Promise<void> {
    await this.roleRepository.findOneAndUpdate({_id: new ObjectId(roleId)}, {$set: _.pickBy({name, authority}, _.identity)})
  }

  /**
   * 删除角色
   * @param roleId 角色id
   */
  async deleteRole(roleId: string): Promise<void> {
    // 超管不能删、有绑定管理员的不能删
    const role = await this.findRoleById(roleId)
    if (!role) {
      throw AdminError.ROLE_NOT_EXISTS
    }

    if (role.name === '超级管理员') {
      throw AdminError.SUPER_CAN_NOT_DELETE
    }

    const relations = await this.countByRoleId(role.id.toString())
    if (relations > 0) {
      throw AdminError.ROLE_CAN_NOT_DELETE
    }

    await this.roleRepository.findOneAndDelete({_id: new ObjectId(roleId)})
  }

  /**
   * 根据角色id统计管理员数量
   * @param roleId 角色id
   */
  async countByRoleId(roleId: string): Promise<number> {
    return this.adminRepository.count({roleId})
  }
}
