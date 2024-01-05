import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyCors, { FastifyCorsOptions } from '@fastify/cors'

export default fp<FastifyCorsOptions>(async (fastify: FastifyInstance) => {
  fastify.register(fastifyCors, {
    origin: ['http://localhost:4201', 'http://localhost:4200', 'http://localhost:3000', 'http://192.168.1.7:3000', 'http://192.168.1.7:4200', 'https://batman-app.vercel.app']
  })
})
