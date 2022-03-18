import {TypeOrmModule} from '@nestjs/typeorm'
import {Column, Entity, Index, ObjectID, ObjectIdColumn} from 'typeorm'
import {DatabaseType} from '../../common/constant'

/**
 * 系统配置表
 */
@Entity('SystemConfig')
export class SystemConfigEntity {
  @ObjectIdColumn()
    id: ObjectID

  /**
   * 模块
   */
  @Column()
    module: string

  /**
   * 配置key
   */
  @Column()
  @Index('key', {unique: true, background: true})
    key: string

  /**
   * 配置值
   */
  @Column()
    value: any

  /**
   * 配置说明
   */
  @Column()
    desc: string
}

export const SystemConfigEntityConnection = TypeOrmModule.forFeature([SystemConfigEntity], DatabaseType.APP)
