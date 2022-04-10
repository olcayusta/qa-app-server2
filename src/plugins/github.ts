import fastifyOauth2, { OAuth2Namespace } from 'fastify-oauth2'
import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'

export default fp(async function (app: FastifyInstance) {
  app.register(fastifyOauth2, {
		name: 'githubOAuth2',
		scope: ['user:email'],
		credentials: {
			client: {
				id: process.env.CLIENT_ID_GITHUB!,
				secret: process.env.CLIENT_SECRET_GITHUB!
			},
			auth: fastifyOauth2.GITHUB_CONFIGURATION
		}, // register a fastify url to start the redirect flow
		startRedirectPath: '/login/github', // facebook redirect here after the user login
		callbackUri: 'http://localhost:9001/users/github/callback'
	})
})
