import fastifyCookie, { FastifyCookieOptions } from '@fastify/cookie'
import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

export default fp<FastifyCookieOptions>(async (fastify: FastifyInstance) => {
  fastify.register(fastifyCookie, {
    secret: 'my-secret',
    parseOptions: {}
  })
})
