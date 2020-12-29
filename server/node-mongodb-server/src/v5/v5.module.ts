import {Module} from '@nestjs/common'
import {Entity} from './entity'
import {Service} from './service'

@Module({
  imports: [...Entity],
  providers: [...Service],
  exports: [...Service]
})
export class V5Module {
}
