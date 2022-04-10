import { wss } from '../ws.server.js'
import fp from 'fastify-plugin'

export default fp(async (fastify, options) => {
	const data = {
		celebName: 'Lisa Joyce',
		picture: 'https://www.theatricalindex.com/media/cimage/persons/lisa-joyce/headshot_headshot.jpg'
	}

	wss.clients.forEach((client) => {
		client.send(JSON.stringify(data))
	})
})
