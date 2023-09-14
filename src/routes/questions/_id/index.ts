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
          properties: {
            questionId: {
              type: 'integer'
            }
          }
        },
        response: {
          200: {
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
              viewCount: {
                type: 'integer'
              },
              acceptedAnswerId: {
                type: 'integer',
                nullable: true
              },
              tags: {
                type: 'array',
                items: {
                  properties: {
                    id: {
                      type: 'integer'
                    },
                    title: {
                      type: 'string'
                    }
                  }
                },
                nullable: true
              },
              user: {
                properties: {
                  id: {
                    type: 'integer'
                  },
                  displayName: {
                    type: 'string'
                  },
                  picture: {
                    type: 'string'
                  },
                  isVerified: {
                    type: 'boolean'
                  }
                }
              }
            }
          }
        }
      }
    },
    async function ({ params }, reply: FastifyReply): Promise<Question> {
      const { id: questionId } = params
      const query: QueryConfig = {
        text: `
          WITH cte AS (
            UPDATE question SET "viewCount" = "viewCount" + 1 WHERE id = $1
              RETURNING id, title, content, "creationTime", "viewCount", tags, "userId", "acceptedAnswerId"
          )
          SELECT cte.id,
                 cte.title,
                 cte.content,
                 cte."creationTime",
                 cte."viewCount",
                 cte."acceptedAnswerId",
                 cte.tags,
                 (
                   SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture, 'isVerified', "isVerified")
                   FROM "user" u
                   WHERE u.id = cte."userId"
                 ) AS "user"
          FROM cte
        `,
        values: [questionId]
      }
      try {
        const { rows: [question] } = await app.pg.query<Question>(query)
        return question ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )
}
