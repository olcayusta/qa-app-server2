import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyCors, { FastifyCorsOptions } from 'fastify-cors'

export default fp(async (fastify: FastifyInstance, opts: FastifyCorsOptions) => {
  fastify.register(fastifyCors, {
    origin: 'http://localhost:4200'
  })
})
