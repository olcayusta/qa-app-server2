import { FastifyInstance, FastifyReply } from 'fastify'
import { QueryConfig } from 'pg'
import { Question } from '@shared/question.model'

export default async (app: FastifyInstance) => {
  app.addHook('onRequest', app.authenticate)
  app.get(
    '/',
    {
      schema: {
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer'
                },
                title: {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    },
    async function ({ user: { id: userId } }, reply: FastifyReply): Promise<Question[]> {
      const query: QueryConfig = {
        text: `
          SELECT q.id, q.title
          FROM question q
                 LEFT JOIN user_favorite_questions ufq ON ufq."questionId" = q.id
          WHERE ufq."userId" = $1
        `,
        values: [userId]
      }
      try {
        const { rows: questions } = await app.pg.query<Question>(query)
        return questions ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )

  app.post<{
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
      }
    },
    async function ({ user: { id: userId }, body }, reply: FastifyReply) {
      const { questionId } = body
      const query: QueryConfig = {
        text: `
          INSERT INTO user_favorite_questions("questionId", "userId")
          VALUES ($1, $2)
          RETURNING *
        `,
        values: [questionId, userId]
      }
      try {
        const { rows } = await app.pg.query(query)
        return rows[0] ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )
}
