import { marked } from 'marked'
import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
	app.post<{
    Body: {
      content: string
      answerId: number
    }
  }>(
		'/',
		{
			onRequest: [app.authenticate]
		},
		async ({ body, user }) => {
			const { content, answerId } = body
			const { sub } = user
			const userId = Number(sub)

			const queryText = `
				INSERT INTO answer_comment (content, text, "userId", "answerId")
				VALUES ($1, $2, $3, $4)
				RETURNING *
			`

			const markedContent = marked.parseInline(content)
			const values = [content, markedContent, userId, answerId]

			try {
				const { rows } = await app.pg.query(queryText, values)
				return rows[0]
			} catch (e) {
				console.error(e)
				throw e
			}
		}
	)
}
