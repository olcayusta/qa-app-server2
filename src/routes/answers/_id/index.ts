import { FastifyInstance } from 'fastify'
import { Answer } from '@shared/answer.model'
import { QueryConfig } from 'pg'

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    }
  }>('/', async function({ params }): Promise<Answer> {
    const { id: answerId } = params
    const query: QueryConfig = {
      text: `
        SELECT *
        FROM answer_comment ac
        WHERE ac."answerId" = $1
      `,
      values: [answerId]
    }
    const { rows: [answer] } = await app.pg.query<Answer>(query)
    return answer
  })
}
