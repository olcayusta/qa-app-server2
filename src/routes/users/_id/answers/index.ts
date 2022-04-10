import { FastifyInstance, FastifyReply } from 'fastify'
import { QueryConfig } from 'pg'
import { Answer } from '@shared/answer.model'

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    }
  }>(
    '/',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            userId: {
              type: 'integer'
            }
          }
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer'
                },
                content: {
                  type: 'string'
                },
                creationTime: {
                  type: 'string',
                  format: 'date-time'
                },
                userId: {
                  type: 'integer'
                },
                questionId: {
                  type: 'integer'
                },
                rawContent: {
                  type: 'string'
                },
                question: {
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
        }
      }
    },
    async function({ params: { id: userId } }, reply: FastifyReply): Promise<Answer[]> {
      const query: QueryConfig = {
        text: `
          SELECT a.id,
                 a.content,
                 a."creationTime",
                 a."userId",
                 a."questionId",
                 json_build_object(
                   'id', q.id,
                   'title', q.title
                   ) AS question
          FROM question_answer a
                 LEFT JOIN question q ON q.id = a."questionId"
          WHERE a."userId" = $1
        `,
        values: [userId]
      }

      try {
        const { rows: answers } = await app.pg.query<Answer>(query)
        return answers ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )
}
