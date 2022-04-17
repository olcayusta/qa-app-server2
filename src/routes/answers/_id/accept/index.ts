import { FastifyInstance, FastifyReply } from 'fastify'
import { QueryConfig } from 'pg'
import { Answer } from '@shared/answer.model'

/**
 * Casts an accept vote on the given answer. auth required
 */
export default async (app: FastifyInstance) => {
  app.put<{
    Params: {
      id: number
    }
    Body: {
      questionId: number
    }
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['questionId'],
          properties: {
            questionId: {
              type: 'integer'
            }
          }
        }
      },
      onRequest: [app.authenticate]
    },
    async function({ params, body, user }, reply: FastifyReply): Promise<Answer> {
      const { id: answerId } = params
      const { questionId } = body
      const userId = user.id

      const query: QueryConfig = {
        text: `
          UPDATE question
          SET "acceptedAnswerId"   = $1,
              "acceptedAnswerTime" = NOW()
          WHERE id = $2
            AND "userId" = $3
          RETURNING *
        `,
        values: [answerId, questionId, userId]
      }

      try {
        const { rows: [answer] } = await app.pg.query<Answer>(query)
        return answer ?? reply.forbidden('You are not the owner of this question')
      } catch (e) {
        throw e
      }
    }
  )
}
