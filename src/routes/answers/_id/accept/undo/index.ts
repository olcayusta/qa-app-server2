import { FastifyInstance } from 'fastify'

/**
 * Undoes an accept vote on the given answer. auth required
 */
export default async (app: FastifyInstance) => {
  app.post('/', { onRequest: [app.authenticate] }, async function() {
    return 'hello world!'
  })
}
