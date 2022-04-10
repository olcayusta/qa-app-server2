import fp from 'fastify-plugin'
import fastifyJwt from 'fastify-jwt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default fp(async function(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: process.env.SUPER_SECRET_KEY!,
    sign: {
      expiresIn: '24h'
    }
  })

  app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      await req.jwtVerify()
    } catch (e) {
      reply.send(e)
    }
  })
})


