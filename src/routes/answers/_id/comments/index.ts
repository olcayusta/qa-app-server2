import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    }
  }>('/', async function(req) {
    const { id: answerId } = req.params
    const { rows } = await app.pg.query(
      `
        SELECT c.id,
               c.text,
               c."creationTime",
               json_build_object('id', u.id, 'displayName', u."displayName", 'picture', u.picture) AS "user"
        FROM answer_comment c
               LEFT JOIN "user" u ON u.id = c."userId"
        WHERE c."answerId" = $1
      `,
      [answerId]
    )
    return rows
  })
}
