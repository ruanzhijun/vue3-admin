import {Module} from '@nestjs/common'
import {SystemModule} from '../system/system.module'
import {Controller} from './controller'
import {Entity} from './entity'
import {Service} from './service'

@Module({
  imports: [...Entity, SystemModule],
  controllers: [...Controller],
  providers: [...Service],
  exports: [...Service]
})
export class AccountModule {
}
