import { FastifyInstance } from 'fastify'
import { Question } from '@shared/question.model'

export default async (app: FastifyInstance) => {
  app.get<{
    Querystring: {
      page: number
      sort: number
    }
  }>(
    '/',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: {
              type: 'integer'
            },
            sort: {
              type: 'boolean'
            }
          }
        }
      }
    },
    async function({ query: { page, sort } }): Promise<Question[]> {
      const offset = page * 12
      const query = {
        text: `
          SELECT q.id,
                 q.title,
                 q."creationTime",
                 (
                   SELECT json_agg(
                            json_build_object(
                              'id', t.id,
                              'title', t.title
                              )
                            )
                   FROM unnest(q.tags) item_id
                          LEFT JOIN tag t ON t.id = item_id
                 ) AS tags,
                 (
                   SELECT json_build_object(
                            'id', id,
                            'displayName', "displayName",
                            'picture', picture
                            )
                   FROM "user" u
                   WHERE u.id = q."userId"
                 ) AS "user"
          FROM question q
          ORDER BY q.id DESC
          LIMIT 12 OFFSET $1
        `,
        values: [offset]
      }

      const { rows: questions } = await app.pg.query<Question>(query)
      return questions
    }
  )
}
