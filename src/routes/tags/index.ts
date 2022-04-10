import { FastifyInstance } from 'fastify'
import { Tag } from '@shared/tag.model'
import { QueryConfig } from 'pg'

export default async (app: FastifyInstance) => {
  /**
   * @api {get} /tags Get all tags
   */
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
                },
                description: {
                  type: 'string'
                },
                questionCount: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    },
    async function(): Promise<Tag[]> {
      const sql2 = `
        SELECT t.id, t.title, t.description, COUNT(t.id) AS "questionCount"
        FROM tag t
               INNER JOIN question_tag qt ON qt."tagId" = t.id
        GROUP BY t.id
        ORDER BY "questionCount" DESC
      `
      const queryText = `
        SELECT t.id, t.title, t.description, count(sub.id) AS "questionCount"
        FROM tag t
               LEFT JOIN LATERAL (
          SELECT q.id
          FROM question q,
               unnest(q.tags) etiket
          WHERE etiket = t.id
          ) AS sub ON TRUE
        GROUP BY t.id
        ORDER BY "questionCount" DESC
        LIMIT 24
      `
      try {
        const { rows: tags } = await app.pg.query<Tag>(queryText)
        return tags
      } catch (e) {
        throw e
      }
    }
  )

  /**
   * @api {get} /search/:searchTerm Get results by searchTerm
   */
  app.get<{
    Params: {
      searchTerm: string
    }
  }>(
    '/search/:searchTerm',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            searchTerm: {
              type: 'string'
            }
          }
        }
      }
    },
    async function({ params }): Promise<Tag[]> {
      const { searchTerm } = params
      const query: QueryConfig = {
        text: `
          SELECT t.id, t.title
          FROM tag t
          WHERE to_tsvector(title) @@ to_tsquery($1)
        `,
        values: [`${searchTerm}:*`]
      }
      try {
        const { rows: tags } = await app.pg.query(query)
        return tags
      } catch (e) {
        throw e
      }
    }
  )
}
