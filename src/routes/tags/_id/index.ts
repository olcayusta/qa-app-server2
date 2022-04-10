import { FastifyInstance, FastifyReply } from 'fastify'
import { Tag } from '@shared/tag.model'
import { QueryConfig } from 'pg'

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    }
  }>('/', async function({ params: { id: tagId } }, reply: FastifyReply): Promise<Tag> {
    const query: QueryConfig = {
      text: `
        SELECT t.id,
               t.title,
               t.description,
               (
                 SELECT json_agg(
                          json_build_object(
                            'id', q.id,
                            'title', q.title,
                            'creationTime', q."creationTime",
                            'user', (
                              SELECT json_build_object(
                                       'id', id,
                                       'displayName', "displayName",
                                       'picture', picture)
                              FROM "user" u
                              WHERE u.id = q."userId"
                            ),
                            'tags', (
                              SELECT json_agg(json_build_object('id', t1.id, 'title', t1.title))
                              FROM tag t1
                              WHERE t1.id IN
                                    (SELECT qt2."tagId"
                                     FROM question_tag qt2
                                     WHERE qt2."questionId" = q.id)
                            )
                            ) ORDER BY q.id DESC
                          )
                 FROM question q
                 WHERE q.id IN (select qt."questionId" FROM question_tag qt WHERE qt."tagId" = t.id)
               ) AS "questions"
        FROM tag t
        WHERE t.id = $1
      `,
      values: [tagId]
    }
    try {
      const { rows: [tag] } = await app.pg.query<Tag>(query)
      return tag ?? reply.notFound()
    } catch (e) {
      throw e
    }
  })
}
