import sharp from 'sharp'
import fetch from 'node-fetch'
import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
  app.get<{
    Querystring: {
      url: string
    }
  }>('/:imageUrl', async function(req) {
    const { url: imgUrl } = req.query
    const response = await fetch(imgUrl)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await sharp(buffer)
      .webp({
        quality: 75
      })
      .toFile('public/image.webp')
    return { status: 200 }
  })
}
