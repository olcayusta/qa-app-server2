import { FastifyInstance, FastifyReply } from 'fastify'
import { QueryConfig } from 'pg'

export default async (fastify: FastifyInstance) => {
  /**
   * Usage of /questions/{id}/downvote POST
   */
  fastify.post<{
    Params: {
      id: string
    },
    Body: {
      questionId: number,
      vote: number
    }
  }>('/', {
    onRequest: [fastify.authenticate]
  },async function({ params, body: {questionId}, user: {id: userId} }, reply: FastifyReply): Promise<any> {
    const query: QueryConfig = {
      text: `
        UPDATE SET question_vote ("questionId", vote, "userId")
        VALUES ($1, $2, $3)
      `,
      values: [questionId, 1, userId]
    }
    try {
      const { rows: [vote] } = await fastify.pg.query(query)
      return vote
    } catch (e) {
      throw e
    }
  })
}
