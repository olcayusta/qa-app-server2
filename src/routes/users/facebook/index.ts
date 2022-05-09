import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default async (app: FastifyInstance) => {
	app.get('/', async function (req, reply) {
		reply.redirect('http://localhost:4200/?=signin=true')
		return 'Hello world!'
	})

	app.get('/callback', async function (req: FastifyRequest, reply: FastifyReply) {
		const token = await app.facebookOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)

		console.log(token.access_token)

		reply.redirect('/users/facebook')
	})
}
