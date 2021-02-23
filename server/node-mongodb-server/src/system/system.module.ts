import {Module, forwardRef} from '@nestjs/common'
import {AccountModule} from '../account/account.module'
import {Entity as V5Entity} from '../v5/entity'
import {V5Module} from '../v5/v5.module'
import {Controller} from './controller'
import {Service} from './service'

@Module({
  imports: [...V5Entity, forwardRef(() => AccountModule), V5Module],
  controllers: [...Controller],
  providers: [...Service],
  exports: [...Service]
})
export class SystemModule {
}
