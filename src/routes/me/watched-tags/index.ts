import { FastifyInstance, FastifyReply } from 'fastify'
import { Tag } from '@shared/tag.model'
import { QueryConfig } from 'pg'

export default async (app: FastifyInstance) => {
  app.get('/', {
    onRequest: [app.authenticate]
  }, async function({ user }, reply: FastifyReply): Promise<Tag[]> {
    const query: QueryConfig = {
      text: `
        SELECT t.id, t.title
        FROM tag t
               LEFT JOIN user_favorite_tags uft ON uft."tagId" = t.id
        WHERE uft."userId" = $1
      `,
      values: [user.sub]
    }
    try {
      const { rows: tags } = await app.pg.query<Tag>(query)
      return tags ?? reply.notFound()
    } catch (e) {
      throw e
    }
  })
}
