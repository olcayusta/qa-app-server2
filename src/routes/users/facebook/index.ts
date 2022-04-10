import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
	app.get('/', async function (request, reply) {
		reply.redirect('http://localhost:4200/?=signin=true')
		return 'Hello world!'
	})

	app.get('/callback', async function (request, reply) {
		const token = await app.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

		console.log(token.access_token)

		reply.redirect('/users/facebook')
	})
}
