import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyCors, { FastifyCorsOptions } from 'fastify-cors'

export default fp<FastifyCorsOptions>(async (fastify: FastifyInstance) => {
  fastify.register(fastifyCors, {
    origin: 'http://localhost:4200'
  })
})
