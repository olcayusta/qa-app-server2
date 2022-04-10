import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
  app.addHook('onRequest', app.authenticate)
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
                }
              }
            }
          }
        }
      }
    },
    async (req, reply) => {
      const userId = Number(req.user.sub)
      const query = {
        text: `
          SELECT q.id, q.title
          FROM question q
                 LEFT JOIN user_favorite_questions ufq ON ufq."questionId" = q.id
          WHERE ufq."userId" = $1
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

  app.post<{
    Body: {
      questionId: number
    }
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['questionId'],
          properties: {
            questionId: {
              type: 'integer'
            }
          }
        }
      }
    },
    async ({ user, body }, reply) => {
      const userId = Number(user.sub)
      const { questionId } = body
      const query = {
        text: `
          INSERT INTO user_favorite_questions("questionId", "userId")
          VALUES ($1, $2)
          RETURNING *
        `,
        values: [questionId, userId]
      }
      try {
        const { rows } = await app.pg.query(query)
        return rows[0] ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )
}
