import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { FastifyJWT } from '@fastify/jwt'

export default async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      onRequest: [app.authenticate]
    },
    async function ({ user }, reply: FastifyReply) {
      const userId = user.id
      const query = {
        text: `
          SELECT q.id,
                 q.title,
                 q."creationTime",
                 (SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                  FROM "user" u
                  WHERE u.id = q."userId") AS "user",
                 (SELECT json_build_object(
                           'creationTime', qa."creationTime",
                           'user',
                           (SELECT json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                            FROM "user" u
                            WHERE u.id = qa."userId")
                           )
                  FROM question_answer qa
                  WHERE qa."questionId" = q.id
                  ORDER BY q.id DESC
                  LIMIT 1)                 AS "answer"
          FROM question q
          WHERE q."userId" = $1
          ORDER BY q.id DESC
        `,
        values: [userId]
      }
      try {
        const { rows } = await app.pg.query(query)
        return rows ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )
}
