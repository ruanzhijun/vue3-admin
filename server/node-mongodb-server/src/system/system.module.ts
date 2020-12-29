import {Module} from '@nestjs/common'
import {Entity} from '../v5/entity'
import {V5Module} from '../v5/v5.module'
import {Controller} from './controller'
import {Service} from './service'

@Module({
  imports: [...Entity, V5Module],
  controllers: [...Controller],
  providers: [...Service],
  exports: [...Service]
})
export class SystemModule {
}
