import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifySensible, { SensibleOptions } from 'fastify-sensible'

export default fp<SensibleOptions>(async (fastify: FastifyInstance, opts: SensibleOptions) => {
  fastify.register(fastifySensible)
})
