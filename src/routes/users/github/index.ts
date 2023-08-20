import fetch from 'node-fetch'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

interface GithubUser {
  name: string
  avatar_url: string
  twitter_username: string
  bio: string
}

export default async (app: FastifyInstance) => {
  app.get('/', async function (req: FastifyRequest, reply: FastifyReply) {
    // reply.redirect('http://localhost:4200/?=signin=true')
    reply.setCookie('foo', 'bar', {
      domain: 'localhost',
      path: '/'
    }).redirect('http://localhost:4200/?=signin=true')
  })

  app.get('/callback', async function (req: FastifyRequest, reply: FastifyReply) {
    const {token} = await app.githubOAuth2.getAccessTokenFromAuthorizationCodeFlow(req)

    const authorizationEndpoint = app.githubOAuth2.generateAuthorizationUri(req, reply)
    console.log(authorizationEndpoint)

    const fetchReq = await fetch(`https://api.github.com/user`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    })

    console.log(token)

    const data = (await fetchReq.json()) as GithubUser

    console.log(data)

    console.log(`Name ${data.name}`)
    console.log(`Name ${data.avatar_url}`)
    console.log(`Name ${data.twitter_username}`)
    console.log(`Name ${data.bio}`)

    const fetchReq2 = await fetch(`https://api.github.com/user/emails`, {
      headers: {
        Authorization: `Bearer ${token.access_token}`
      }
    })

    const data2 = await fetchReq2.json()
    // console.dir(data2)

    /* reply.send({
			access_token: token.access_token
		}) */

    reply.redirect('/users/github')
  })
}
