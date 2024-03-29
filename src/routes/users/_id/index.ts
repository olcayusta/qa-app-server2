import { FastifyInstance, FastifyReply, FastifySchema } from 'fastify'
import { User } from '@shared/user.model'
import { QueryConfig } from 'pg'

const userSchema: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      userId: {
        type: 'integer'
      }
    }
  },
  response: {
    200: {
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
        isVerified: {
          type: 'boolean'
        },
        signupDate: {
          type: 'string',
          format: 'date-time'
        },
        lastSeenTime: {
          type: 'string',
          format: 'date-time'
        },
        githubUrl: {
          type: 'string',
          nullable: true
        },
        twitterUrl: {
          type: 'string',
          nullable: true
        }
      }
    }
  }
}

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    }
  }>(
    '/',
    {
      schema: userSchema
    },
    async function({ params }, reply: FastifyReply): Promise<User> {
      const { id: userId } = params
      const query: QueryConfig = {
        text: `
          SELECT id, "displayName", picture, "isVerified", "signupDate", "lastSeenTime", "githubUrl", "twitterUrl"
          FROM "user"
          WHERE id = $1
        `,
        values: [userId]
      }

      try {
        const { rows: [user] } = await app.pg.query<User>(query)
        return user ?? reply.notFound()
      } catch (e) {
        console.error(e)
        throw e
      }
    }
  )
}
