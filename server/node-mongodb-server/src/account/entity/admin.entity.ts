import {TypeOrmModule} from '@nestjs/typeorm'
import {Column, Entity, Index, ObjectID, ObjectIdColumn} from 'typeorm'
import {DatabaseType} from '../../common/constant'

/**
 * 管理员表
 */
@Entity('Admin')
export class AdminEntity {
  @ObjectIdColumn()
  id: ObjectID

  /**
   * 管理员登录邮箱
   */
  @Column()
  @Index('email', {background: true, unique: true})
  email: string

  /**
   * 管理员用户名
   */
  @Column()
  @Index('username')
  username: string

  /**
   * 管理员登录密码
   */
  @Column()
  password: string

  /**
   * 状态
   */
  @Column()
  status: 'enable' | 'frozen'

  /**
   * 角色id
   */
  @Column()
  roleId: string[]

  /**
   * 加入时间
   */
  @Column()
  createTime: number

  /**
   * 最后登录时间
   */
  @Column()
  lastLoginTime: number

  /**
   * 最后登录ip
   */
  @Column()
  lastLoginIp: string
}

export const AdminEntityConnection = TypeOrmModule.forFeature([AdminEntity], DatabaseType.DASHBOARD)
