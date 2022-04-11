import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyPostgres, { PostgresPluginOptions } from 'fastify-postgres'

export default fp(
  async (fastify: FastifyInstance, options: PostgresPluginOptions) => {
    fastify.register(fastifyPostgres, {
      connectionString: process.env.CONNECTION_STRING
    })
  }
)
