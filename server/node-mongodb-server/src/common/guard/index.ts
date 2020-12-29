import {APP_GUARD} from '@nestjs/core'
import {AuthorityGuard} from './authority.guard'
import {JwtGuard} from './jwt.guard'

export const Guards = [
  {
    provide: APP_GUARD,
    useClass: JwtGuard
  },
  {
    provide: APP_GUARD,
    useClass: AuthorityGuard
  }
]
