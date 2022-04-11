import 'fastify'
import { OAuth2Namespace } from 'fastify-oauth2'
import { User } from '@shared/user.model'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any
    githubOAuth2: OAuth2Namespace
    facebookOAuth2: OAuth2Namespace
  }
}

declare module 'ws' {
  interface Server {
    odalar: Set<string>
  }

  interface WebSocket {
    id: string

    join(room: string): void

    leave(room: string): void
  }
}

declare module 'fastify-jwt' {
  interface FastifyJWT {
    payload: {
      readonly id: number
    }
    user: User
  }
}
