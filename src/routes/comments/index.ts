import { FastifyInstance, FastifyReply } from 'fastify'
import { Comment } from '@shared/comment.model'
import { marked } from 'marked'
import { QueryConfig } from 'pg'

export default async (app: FastifyInstance) => {
  app.post<{
    Body: {
      content: string
      questionId: number
    }
  }>(
    '/',
    {
      onRequest: [app.authenticate]
    },
    async function ({ body, user }, reply: FastifyReply): Promise<Comment> {
      const { content, questionId } = body
      const { sub } = user
      const userId = Number(sub)

      const markedContent = marked.parseInline(content)

      const query: QueryConfig = {
        text: `
          INSERT INTO question_comment (content, text, "userId", "questionId")
          VALUES ($1, $2, $3, $4) RETURNING *
        `,
        values: [content, markedContent, userId, questionId]
      }

      try {
        const {
          rows: [comment]
        } = await app.pg.query<Comment>(query)
        return comment
      } catch (e) {
        throw e
      }
    }
  )
}
