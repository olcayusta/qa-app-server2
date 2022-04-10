import { FastifyInstance } from 'fastify'
import { Comment } from '@shared/comment.model'
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
            questionId: {
              type: 'integer'
            }
          }
        }
      }
    },
    async function({ params: { id: questionId } }): Promise<Comment[]> {
      const query: QueryConfig = {
        text: `
          SELECT qc.id,
                 qc.content,
                 qc.text,
                 qc."creationTime",
                 (
                   SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                   FROM "user" u
                   WHERE u.id = qc."userId"
                 ) AS "user"
          FROM question_comment qc
          WHERE qc."questionId" = $1`,
        values: [questionId]
      }
      try {
        const { rows: comments } = await app.pg.query<Comment>(query)
        return comments
      } catch (e) {
        throw e
      }
    }
  )
}
