import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyOauth2, { FastifyOAuth2Options } from '@fastify/oauth2'

export default fp<FastifyOAuth2Options>(async (fastify: FastifyInstance) => {
  fastify.register(fastifyOauth2, {
    name: 'githubOAuth2',
    scope: ['user:email'],
    credentials: {
      client: {
        id: process.env.CLIENT_ID_GITHUB!,
        secret: process.env.CLIENT_SECRET_GITHUB!
      },
      auth: fastifyOauth2.GITHUB_CONFIGURATION
    },
    startRedirectPath: '/login/github',
    callbackUri: 'http://localhost:9001/users/github/callback'
  })
})
