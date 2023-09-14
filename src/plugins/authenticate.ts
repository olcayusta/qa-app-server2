import fp from 'fastify-plugin'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyJwt, { FastifyJWTOptions } from '@fastify/jwt'

export default fp<FastifyJWTOptions>(async (fastify: FastifyInstance) => {
  fastify.register(fastifyJwt, {
    secret: 'supersecret'
  })

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (e) {
      reply.send(e)
    }
  })
})
