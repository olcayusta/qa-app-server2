import { FastifyInstance, FastifyReply } from 'fastify'
import { Question } from '@shared/question.model'
import { QueryConfig } from 'pg'

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
                title: {
                  type: 'string'
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
                viewCount: {
                  type: 'integer'
                },
                tags: {
                  type: 'array',
                  nullable: true
                },
                tags2: {
                  type: 'array',
                  nullable: true
                },
                acceptedAnswerId: {
                  type: 'integer',
                  nullable: true
                }
              }
            }
          }
        }
      }
    },
    async ({ params: { id: userId } }, reply: FastifyReply): Promise<Question[]> => {
      const query: QueryConfig = {
        text: `
          SELECT *
          FROM question
          WHERE "userId" = $1
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
}
