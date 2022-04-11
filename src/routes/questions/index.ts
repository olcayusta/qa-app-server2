import { FastifyInstance, FastifyReply } from 'fastify'
import { marked } from 'marked'
import { wss } from '../../ws.server.js'
import { Question } from '@shared/question.model'
import { QueryConfig } from 'pg'

/*const sql = `(
           select jsonb_agg(
                          jsonb_build_object('id', t.id, 'title', t.title)
                      )
           from tag t
                    left join question_tag qt ON qt."tagId" = t.id where qt."questionId" = q.id
       ) AS tags`*/

/*	(
		select jsonb_agg(
	jsonb_build_object('id', t.id, 'title', t.title)
)
from unnest(q.tags) item_id
left join tag t on t.id = item_id
) AS tags*/

export default async (app: FastifyInstance) => {
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
                },
                creationTime: {
                  type: 'string',
                  format: 'date-time'
                },
                tags: {
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
                  },
                  nullable: true
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
                    },
                    isVerified: {
                      type: 'boolean'
                    }
                  }
                },
                answer: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer'
                    },
                    creationTime: {
                      type: 'string',
                      format: 'date-time'
                    },
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer'
                        },
                        displayName: {
                          type: 'string'
                        }
                      }
                    }
                  },
                  nullable: true
                }
              }
            }
          }
        }
      }
    },
    async function (): Promise<Question[]> {
      const queryText = `
        SELECT q.id,
               q.title,
               q."creationTime",
               (
                 SELECT json_agg(
                          json_build_object(
                            'id', t.id,
                            'title', t.title
                            )
                          )
                 FROM tag t
                        LEFT JOIN question_tag qt ON qt."tagId" = t.id
                 WHERE qt."questionId" = q.id
               ) AS tags,
               (
                 SELECT json_build_object(
                          'id', id,
                          'displayName', "displayName",
                          'picture', picture,
                          'isVerified', "isVerified"
                          )
                 FROM "user" u
                 WHERE u.id = q."userId"
               ) AS "user",
               (
                 SELECT json_build_object(
                          'id', qa.id,
                          'creationTime', qa."creationTime",
                          'user', json_build_object(
                            'id', u2.id,
                            'displayName', u2."displayName"
                            )
                          )
                 FROM question_answer qa
                        LEFT JOIN "user" u2 ON u2.id = qa."userId"
                 WHERE qa."questionId" = q.id
                 ORDER BY qa.id DESC
                 LIMIT 1
               ) AS "answer"
        FROM question q
        ORDER BY q.id DESC
        limit 12
      `
      try {
        const { rows: questions } = await app.pg.query<Question>(queryText)
        return questions
      } catch (e) {
        throw e
      }
    }
  )

  app.get<{
    Querystring: {
      sort: string
      filter: string
    }
  }>('/sort/:params', async function ({ query }, reply: FastifyReply) {
    let textQuery = ``
    const { sort, filter } = query

    if (sort === 'popularity') {
      textQuery = `
        SELECT q.id,
               q."creationTime",
               q.content,
               q.title,
               (
                 SELECT json_agg(
                          json_build_object(
                            'id', t.id,
                            'title', t.title
                            )
                          )
                 FROM unnest(q.tags) item_id
                        LEFT JOIN tag t ON t.id = item_id
               ) AS tags,
               (
                 SELECT json_build_object(
                          'id', id, 'displayName',
                          "displayName", 'picture', picture
                          )
                 FROM "user" u
                 WHERE u.id = q."userId"
               ) AS "user"
        FROM question q
        ORDER BY q."viewCount" DESC
        LIMIT 12`
    }

    if (sort === 'activity') {
      textQuery = `
        SELECT q.id,
               q.title,
               q."creationTime",
               "answerTime"."creationTime" AS "answerTime",
               (
                 SELECT json_agg(
                          json_build_object(
                            'id', t.id,
                            'title', t.title
                            )
                          )
                 FROM unnest(q.tags) item_id
                        LEFT JOIN tag t ON t.id = item_id
               )                           AS tags,
               (
                 SELECT json_build_object(
                          'id', id,
                          'displayName', "displayName",
                          'picture', picture
                          )
                 FROM "user" u
                 WHERE u.id = q."userId"
               )                           AS "user"
        FROM question q,
             LATERAL (
               SELECT MAX(qa."creationTime") AS "creationTime"
               FROM question_answer qa
               WHERE qa."questionId" = q.id
               ) AS "answerTime"
        ORDER BY (
                   GREATEST(q."creationTime", "answerTime"."creationTime")
                   ) DESC
        LIMIT 12
      `
    }

    if (sort === 'date') {
      textQuery = `
        select q.id,
               q."creationTime",
               q.content,
               q.title,
               (
                 select json_agg(
                          json_build_object('id', t.id, 'title', t.title)
                          )
                 from unnest(q.tags) item_id
                        left join tag t on t.id = item_id
               ) as tags,
               (
                 select json_build_object('id', id, 'displayName', "displayName", 'picture', picture)
                 from "user" u
                 where u.id = q."userId"
               ) as "user"
        from question q
        order by q.id desc
        limit 12`
    }

    try {
      const { rows: questions } = await app.pg.query<Question>(textQuery)
      return questions
    } catch (e) {
      throw e
    }
  })

  app.post<{
    Body: {
      title: string
      content: string
      tags: number[]
    }
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            content: {
              type: 'string'
            },
            tags: {
              type: 'array',
              minItems: 0,
              maxItems: 4
            }
          }
        }
      },
      preValidation: [app.authenticate]
    },
    async function ({ body, user }) {
      const { title, content, tags } = body
      const { id: userId } = user
      const query: QueryConfig = {
        text: `
          WITH cte1 AS
                 (
                   INSERT INTO "question" (title, content, "userId", tags) VALUES ($1, $2, $3, $4) RETURNING id AS question_id
                 ),
               cte2 AS
                 (
                   INSERT INTO question_revision (title, content, "questionId", "userId", tags) VALUES ($1, $5, (SELECT question_id FROM cte1), $3, $4)
                 )
          INSERT
          INTO question_tag ("questionId", "tagId")
          SELECT (SELECT question_id FROM cte1), unnest($4::int[])
        `,
        values: [
          title,
          marked.parse(content, {
            sanitize: false
          }),
          userId,
          tags,
          content
        ]
      }

      try {
        wss.clients.forEach((client) => {
          client.send(
            JSON.stringify({
              event: 'new_question',
              payload: {
                id: 101
              }
            })
          )
        })
        const {
          rows: [question]
        } = await app.pg.query<Question>(query)
        return question
      } catch (e) {
        throw e
      }
    }
  )
}
