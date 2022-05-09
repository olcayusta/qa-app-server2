import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyOauth2, { FastifyOAuth2Options } from '@fastify/oauth2'

export default fp<FastifyOAuth2Options>(async (app: FastifyInstance) => {
  app.register(fastifyOauth2, {
    name: 'facebookOAuth2',
    scope: ['user:email'],
    credentials: {
      client: {
        id: process.env.CLIENT_ID_FB!,
        secret: process.env.CLIENT_SECRET_FB!
      },
      auth: fastifyOauth2.FACEBOOK_CONFIGURATION
    },
    startRedirectPath: '/login/facebook',
    callbackUri: 'http://localhost:9001/users/facebook/callback'
  })
})
