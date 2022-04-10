import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyEtag, { FastifyEtagOptions } from 'fastify-etag'

export default fp(async (fastify: FastifyInstance, options: FastifyEtagOptions) => {
  fastify.register(fastifyEtag)
})
