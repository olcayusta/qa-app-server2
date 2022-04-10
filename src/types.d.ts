import 'fastify-jwt'
import 'fastify'
import { OAuth2Namespace } from 'fastify-oauth2'

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


declare module "fastify-jwt" {
  interface FastifyJWT {
    payload: { id: number } // payload type is used for signing and verifying
    user: {
      id: number,
      name: string,
      age: number,
      sub: string
    } // user type is return type of `request.user` object
  }
}
