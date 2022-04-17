import { FastifyInstance, FastifyReply } from 'fastify'
import { Answer } from '@shared/answer.model'
import { QueryConfig } from 'pg'
import { marked } from 'marked'
import { wss } from '../../ws.server.js'

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
      const { id: userId } = user
      const query: QueryConfig = {
        text: `
          WITH cte AS (
            INSERT INTO question_answer (content, "userId", "questionId")
              VALUES ($1, $2, $3)
              RETURNING id, content, "creationTime", "userId", "questionId", "rawContent")
          SELECT id,
                 content,
                 "creationTime",
                 "userId",
                 "questionId",
                 "rawContent",
                 (SELECT "userId"
                  FROM question q
                  WHERE q.id = "questionId") AS "receiverId"
          FROM cte
        `,
        values: [marked.parse(content), userId, questionId]
      }

      try {
        const { rows: [{ receiverId, ...room }] } = await app.pg.query<Answer>(query)

        wss.clients.forEach((ws) => {
          // TODO: notify viewers of the question
          if (wss.rooms.has(`q:${questionId}`) && wss.rooms.get(`q:${questionId}`)?.has(ws.id)) {
            ws.send(
              JSON.stringify({
                event: `q:${questionId}`,
                payload: {
                  userId: receiverId,
                  questionId
                }
              })
            )
          }

          // TODO: send notification to question owner
          if (wss.rooms.get(`u:${receiverId}`)?.has(ws.id)) {
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
}
