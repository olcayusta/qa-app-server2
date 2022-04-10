import { FastifyInstance, FastifyReply } from 'fastify'
import { marked } from 'marked'
import { rooms, wss } from '../../ws.server.js'
import { QueryConfig } from 'pg'
import { Answer } from '@shared/answer.model'

export default async (app: FastifyInstance) => {
  app.post<{
    Body: {
      content: string
      questionId: number
    }
  }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              minLength: 24
            },
            questionId: {
              type: 'integer'
            }
          },
          required: ['content', 'questionId']
        }
      },
      preValidation: [app.authenticate]
    },
    async function({ body, user }): Promise<Answer> {
      const { content, questionId } = body
      const { sub: userId } = user
      const query: QueryConfig = {
        text: `
          WITH cte AS (
            INSERT INTO question_answer (content, "userId", "questionId")
              VALUES ($1, $2, $3)
              RETURNING id, content, "creationTime", "userId", "questionId", "rawContent"
          )
          SELECT id,
                 content,
                 "creationTime",
                 "userId",
                 "questionId",
                 "rawContent",
                 (
                   SELECT "userId"
                   FROM question q
                   WHERE q.id = "questionId"
                 ) AS "receiverId"
          FROM cte
        `,
        values: [marked.parse(content), userId, questionId]
      }

      try {
        const { rows: [{receiverId, ...room}] } = await app.pg.query<Answer>(query)

        wss.clients.forEach((ws) => {
          // TODO: Soruyu okuyanlara bildirim gonder
          if (rooms.has(`subscribe_${questionId}`) && rooms.get(`subscribe_${questionId}`)?.has(ws.id)) {
            ws.send(
              JSON.stringify({
                event: `subscribe_${questionId}`,
                payload: {
                  userId: receiverId,
                  questionId
                }
              })
            )
          }

          // FIXME: Send notification to answer owner
          if (rooms.get(`u:${receiverId}`)?.has(ws.id)) {
            ws.send(
              JSON.stringify({
                event: `new answer`,
                payload: {
                  userId: receiverId,
                  questionId
                }
              })
            )
          }
        })

        return room
      } catch (e) {
        throw e
      }
    }
  )

  /**
   * Casts an accept vote on the given answer. auth required
   */
  app.put<{
    Params: {
      answerId: number
    },
    Body: {
      questionId: number
    }
  }>(
    '/:answerId/accept',
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
      },
      onRequest: [app.authenticate]
    },
    async function({ params, body, user }, reply: FastifyReply) {
      const { answerId } = params
      const { questionId } = body
      const userId = Number(user.sub)

      const query: QueryConfig = {
        text: `
          UPDATE question
          SET "acceptedAnswerId"   = $1,
              "acceptedAnswerTime" = NOW()
          WHERE id = $2
            AND "userId" = $3
          RETURNING *
        `,
        values: [answerId, questionId, userId]
      }

      try {
        const { rows: [answer], rowCount } = await app.pg.query<Answer>(query)
        rowCount === 0 && reply.forbidden('You are not the owner of this question')
        return answer
      } catch (e) {
        throw e
      }
    }
  )

  /**
   * Undoes an accept vote on the given answer. auth required
   */
  app.post(
    '/:answerId/accept/undo',
    { onRequest: [app.authenticate] },
    async () => {
      return 'hello world!'
    }
  )
}
