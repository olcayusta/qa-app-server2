import fetch from 'node-fetch'
import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
	app.get('/', async function (req, reply) {
		reply.redirect('http://localhost:4200/?=signin=true')
		return 'Hello world!'
	})

	app.get('/callback', async function (req, reply) {
		const token = await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)

		console.log(token.access_token)

		const fetchReq = await fetch(`https://api.github.com/user`, {
			headers: {
				Authorization: `Bearer ${token.access_token}`
			}
		})

		const data = await fetchReq.json()
		console.dir(data)
		// @ts-ignore
    console.log(`Name ${data.name}`)
		// @ts-ignore
    console.log(`Name ${data.avatar_url}`)

		const fetchReq2 = await fetch(`https://api.github.com/user/emails`, {
			headers: {
				Authorization: `Bearer ${token.access_token}`
			}
		})

		const data2 = await fetchReq2.json()
		console.dir(data2)

		/* reply.send({
			access_token: token.access_token
		}) */

		reply.redirect('/users/github')
	})
}
