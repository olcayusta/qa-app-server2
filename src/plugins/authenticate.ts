import fp from 'fastify-plugin'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt, { FastifyJWTOptions } from 'fastify-jwt'

export default fp<FastifyJWTOptions>(async (app: FastifyInstance) => {
  app.register(fastifyJwt, {
    secret: process.env.SUPER_SECRET_KEY!,
    sign: {
      expiresIn: '24h'
    }
  })

  app.decorate(
    'authenticate',
    async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        await req.jwtVerify()
      } catch (e) {
        reply.send(e)
      }
    }
  )
})
