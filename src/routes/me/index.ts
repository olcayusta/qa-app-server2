import { FastifyInstance, FastifyReply } from 'fastify'
import { User } from '@shared/user.model'
import { QueryConfig } from 'pg'

export default async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      onRequest: [app.authenticate],
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              id: {
                type: 'integer'
              },
              displayName: {
                type: 'string'
              },
              picture: {
                type: 'string'
              },
              email: {
                type: 'string'
              },
              password: {
                type: 'string'
              },
              signupDate: {
                type: 'string'
              },
              lastSeenTime: {
                type: 'string'
              },
              isVerified: {
                type: 'boolean'
              },
              githubUrl: {
                type: 'string'
              },
              twitterUrl: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    async function ({ user }, reply: FastifyReply): Promise<User> {
      const { sub: userId } = user
      const query: QueryConfig = {
        text: `
          SELECT *
          FROM "user"
          WHERE id = $1
        `,
        values: [userId]
      }
      try {
        const {
          rows: [user]
        } = await app.pg.query<User>(query)
        return user ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )
}
