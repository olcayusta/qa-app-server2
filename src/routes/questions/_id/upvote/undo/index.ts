import { FastifyInstance, FastifyReply } from 'fastify'
import { QueryConfig } from 'pg'

export default async (fastify: FastifyInstance) => {
  /**
   * Usage of /answers/{id}/upvote/undo POST
   */
  fastify.delete<{
    Params: {
      id: number
    }
  }>('/', async function({ params: { id: questionId }, user: { id: userId } }, reply: FastifyReply): Promise<any> {
    const query: QueryConfig = {
      text: `
        DELETE
        FROM question_vote
        WHERE "questionId" = $1
          AND "userId" = $2
      `,
      values: [questionId, userId]
    }
    const { rows } = await fastify.pg.query(query)
    return rows[0]
  })
}
