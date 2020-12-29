import {Module} from '@nestjs/common'
import {AccountModule} from './account/account.module'
import {MongodbDatabase} from './common/database'
import {Guards} from './common/guard'
import {SystemModule} from './system/system.module'

@Module({
  imports: [
    ...MongodbDatabase,
    AccountModule,
    SystemModule
  ],
  providers: [
    ...Guards
  ]
})
export class AppModule {
}
