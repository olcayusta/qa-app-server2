import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
  app.get<{
    Params: {
      id: number
    }
  }>('/', async function({ params: { id: questionId } }) {
    const text = `
      SELECT *
      FROM question_revision qr
      WHERE qr."questionId" = $1
    `
    try {
      const { rows } = await app.pg.query(text, [questionId])
      return rows[0]
    } catch (e) {
      throw e
    }
  })
}
