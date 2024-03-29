import { FastifyInstance } from 'fastify'
import fetch from 'node-fetch'
import sharp from 'sharp'

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

  app.get('/manual', async function() {
    await sharp('sharp.avif')
      .resize({
        width: 192,
        height: 192,
        fit: 'cover'
      }).webp({
        quality: 70
      })
      .toFile('girl.webp')

    return {
      sucess: 'ok'
    }
  })
}

