import { app } from './app.js'
import { wss } from './ws.server.js'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'

app.server.on('upgrade', async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  const { url, headers } = req

  const { pathname } = new URL(url!, headers.origin)

  if (pathname === '/notification') {
    const protocol = headers['sec-websocket-protocol']

    wss.handleUpgrade(req, socket, head, (ws) => {
      let client: any = {}
      try {
        client = app.jwt.decode(protocol!)
        const clientId = client.id
      } catch (error) {
        throw error
      }
      wss.emit('connection', ws, req, client)
    })
  } else {
    // socket.destroy()
  }
})

try {
  const { PORT } = process.env
  await app.listen(PORT!)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
