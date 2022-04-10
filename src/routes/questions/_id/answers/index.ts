import { FastifyInstance } from 'fastify'
import { Answer } from '@shared/answer.model'
import { QueryConfig } from 'pg'

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    },
    Querystring: {
      sort_by: string
    }
  }>(
    '/',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            questionId: {
              type: 'integer'
            }
          }
        }
      }
    },
    async function({ params: { id: questionId }, query: query2 }): Promise<Answer[]> {
      const { sort_by: sort } = query2
      const query: QueryConfig = {
        text: `
          SELECT a.id,
                 a.content,
                 a."creationTime",
                 x.comments,
                 (
                   SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                   FROM "user" u
                   WHERE u.id = a."userId"
                 ) AS "user"
          FROM question_answer a
                 LEFT JOIN LATERAL (
            SELECT json_agg(
                     json_build_object(
                       'id', c.id,
                       'text', c.text,
                       'user', json_build_object('id', u.id, 'displayName', u."displayName", 'picture', u.picture)
                       )
                     ) comments
            FROM answer_comment c
                   LEFT JOIN "user" u ON u.id = c."userId"
            WHERE c."answerId" = a.id ) x ON TRUE
          WHERE a."questionId" = $1
          ORDER BY a.id
        `,
        values: [questionId]
      }

      switch (sort) {
        case 'DESC':
          query.text = `
            SELECT a.id,
                   a.content,
                   a."creationTime",
                   (
                     SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                     FROM "user" u
                     WHERE u.id = a."userId"
                   ) AS "user"
            FROM question_answer a
            WHERE a."questionId" = $1
            ORDER BY a.id DESC
          `
          break
        case 'ASC':
          query.text = `
            SELECT a.id,
                   a.content,
                   a."creationTime",
                   (
                     SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                     FROM "user" u
                     WHERE u.id = a."userId"
                   ) AS "user"
            FROM question_answer a
            WHERE a."questionId" = $1
            ORDER BY a.id ASC
          `
          break
        default:
          query.text = `
            SELECT a.id,
                   a.content,
                   a."creationTime",
                   (
                     SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                     FROM "user" u
                     WHERE u.id = a."userId"
                   ) AS "user"
            FROM question_answer a
            WHERE a."questionId" = $1
            ORDER BY a.id ASC
          `
      }

      try {
        const { rows: answers } = await app.pg.query<Answer>(query)
        return answers
      } catch (e) {
        throw e
      }
    }
  )
}
