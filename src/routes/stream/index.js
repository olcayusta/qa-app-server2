export default async (app) => {
	app.get('/', async (req, reply) => {
		const headers = {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'text/event-stream',
			Connection: 'keep-alive',
			'Cache-Control': 'no-cache'
		}

		reply.raw.writeHead(200, headers)
		reply.raw.write(
			`event: ${String('message')} \ndata: ${JSON.stringify({ msg: 'hello from server' })}\n\n`
		)
	})
}
