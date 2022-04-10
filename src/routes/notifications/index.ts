import { FastifyInstance, FastifyReply } from 'fastify'
import { QueryConfig } from 'pg'
import { Notification } from '@shared/notification.model'

export default async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      onRequest: [app.authenticate],
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
                senderId: {
                  type: 'integer'
                },
                receiverId: {
                  type: 'integer'
                },
                text: {
                  type: 'string'
                },
                type: {
                  type: 'number'
                },
                creationTime: {
                  type: 'string',
                  format: 'date-time'
                },
                isRead: {
                  type: 'boolean'
                },
                user: {
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
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    async function({ user }): Promise<Notification[]> {
      const userId = user.sub
      const query: QueryConfig = {
        text: `
          SELECT n.id,
                 n.text,
                 n.type,
                 n."creationTime",
                 n."isRead",
                 (
                   SELECT json_build_object(
                            'id', id, 'displayName', "displayName", 'picture', picture
                            )
                   FROM "user" u
                   WHERE u.id = n."senderId"
                 ) AS "user"
          FROM notification n
          WHERE n."receiverId" = $1
        `,
        values: [userId]
      }
      try {
        const { rows: notifications } = await app.pg.query<Notification>(query)
        return notifications
      } catch (e) {
        throw e
      }
    }
  )

  app.get(
    '/unseen-count',
    {
      onRequest: [app.authenticate]
    },
    async function({ user }, reply: FastifyReply): Promise<{ unseenCount: number }> {
      const { sub: userId } = user
      const query: QueryConfig = {
        text: `
          SELECT COUNT(n.id)::INTEGER AS "unseenCount"
          FROM notification n
          WHERE "receiverId" = $1
            AND NOT "isRead"
        `,
        values: [userId]
      }
      const {
        rows: [{ unseenCount }]
      } = await app.pg.query(query)

      reply.header('cache-control', 'private')
      return { unseenCount }
    }
  )
}
