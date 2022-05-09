import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyEtag, { FastifyEtagOptions } from '@fastify/etag'

export default fp<FastifyEtagOptions>(async (fastify: FastifyInstance) => {
  fastify.register(fastifyEtag)
})
