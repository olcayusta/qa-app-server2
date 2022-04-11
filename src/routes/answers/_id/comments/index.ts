import { FastifyInstance } from 'fastify'
import { Comment } from '@shared/comment.model'

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    }
  }>('/', async function (req): Promise<Comment[]> {
    const { id: answerId } = req.params
    const { rows: comments } = await app.pg.query<Comment>(
      `
        SELECT c.id,
               c.text,
               c."creationTime",
               json_build_object(
                 'id', u.id,
                 'displayName', u."displayName",
                 'picture', u.picture
                 ) AS "user"
        FROM answer_comment c
               LEFT JOIN "user" u ON u.id = c."userId"
        WHERE c."answerId" = $1
      `,
      [answerId]
    )
    return comments
  })
}
