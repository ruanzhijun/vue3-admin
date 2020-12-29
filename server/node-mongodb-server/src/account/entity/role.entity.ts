import {TypeOrmModule} from '@nestjs/typeorm'
import {Column, Entity, Index, ObjectID, ObjectIdColumn} from 'typeorm'
import {DatabaseType} from '../../common/constant'

/**
 * 角色表
 */
@Entity('Role')
export class RoleEntity {
  @ObjectIdColumn()
  id: ObjectID
  /**
   * 角色名
   */
  @Column()
  @Index('name', {background: true, unique: true})
  name: string
  /**
   * 状态
   */
  @Column()
  status: 'enable' | 'frozen'
  /**
   * 角色可以访问的菜单、按钮
   */
  @Column()
  authority: any
  /**
   * 角色生成时间
   */
  @Column()
  createTime: number
}

export const RoleEntityConnection = TypeOrmModule.forFeature([RoleEntity], DatabaseType.DASHBOARD)
