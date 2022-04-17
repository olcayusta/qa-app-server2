import { FastifyInstance, FastifyReply, FastifySchema } from 'fastify'
import { User } from '@shared/user.model'
import { QueryConfig } from 'pg'

const allUsersListResponseSchema: FastifySchema = {
  response: {
    200: {
      type: 'array',
      items: {
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
          signupDate: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    }
  }
}

export default async (app: FastifyInstance) => {
  app.get(
    '/',
    {
      schema: allUsersListResponseSchema
    },
    async function(): Promise<User[]> {
      const queryText = `
        SELECT id,
               "displayName",
               picture,
               "signupDate"
        FROM "user"
        ORDER BY id DESC
      `
      try {
        const { rows: users } = await app.pg.query<User>(queryText)
        return users
      } catch (e) {
        throw e
      }
    }
  )

  /**
   * Email validation
   */
  app.post<{
    Body: {
      email: string
    }
  }>(
    '/email',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email'
            }
          }
        }
      }
    },
    async function({ body }, reply: FastifyReply): Promise<string> {
      const { email } = body
      const query: QueryConfig = {
        text: `
          SELECT id,
                 email
          FROM "user"
          WHERE email = $1
        `,
        values: [email]
      }
      const {
        rows: [user]
      } = await app.pg.query<User>(query)
      return user.displayName ?? reply.notFound()
    }
  )

  app.post<{
    Body: {
      email: string
      password: string
      displayName: string
      picture: string
    }
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password', 'displayName'],
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string',
              minLength: 6
            },
            displayName: {
              type: 'string'
            },
            picture: {
              type: 'string'
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: {
                type: 'integer'
              },
              email: {
                type: 'string',
                format: 'email'
              },
              password: {
                type: 'string'
              },
              picture: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    async function({ body: { email, password, picture, displayName } }, reply: FastifyReply): Promise<User> {
      const query: QueryConfig = {
        text: `
          INSERT INTO "user"
            (email, password, "displayName", picture)
          VALUES ($1, $2, $3, $4)
          RETURNING id, email, "displayName", picture
        `,
        values: [email, password, displayName, picture]
      }
      try {
        const { rows: [user] } = await app.pg.query<User>(query)
        return user ?? reply.notFound()
      } catch (e) {
        throw e
      }
    }
  )

  /**
   * User login
   */
  app.post<{
    Body: {
      email: string
      password: string
    }
  }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email'
            },
            password: {
              type: 'string',
              minLength: 6
            }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: {
                type: 'integer'
              },
              email: {
                type: 'string'
              },
              displayName: {
                type: 'string'
              },
              picture: {
                type: 'string'
              },
              token: {
                type: 'string'
              }
            }
          }
        }
      }
    },
    async function({ body: { email, password } }, reply: FastifyReply): Promise<User> {
      const query: QueryConfig = {
        text: `
          SELECT id,
                 email,
                 "displayName",
                 picture
          FROM "user"
          WHERE email = $1
            AND password = $2
        `,
        values: [email, password]
      }
      const {
        rows: [user]
      } = await app.pg.query<User>(query)

      user.token = app.jwt.sign(user, {
        sub: user.id.toString()
      })

      return user ?? reply.notFound()
    }
  )
}
