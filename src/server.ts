import { app } from './app.js'
import { wss } from './ws.server.js'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'

app.server.on('upgrade', async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  const { url, headers } = req

  const { pathname } = new URL(url!, headers.origin)

  if (pathname === '/notification') {
    const protocol = headers['sec-websocket-protocol']

    try {

      const client: any = app.jwt.decode(protocol!)
      // console.log(decocedToken);

      wss.handleUpgrade(req, socket, head, (ws) => {
        const clientId = client.id
        wss.emit('connection', ws, req, client)
      })
    } catch (error) {
      /*			socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
      return*/

      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req, {})
      })
    }
  } else {
    // socket.destroy()
  }
})

try {
  const { PORT } = process.env
  await app.listen(PORT!)
  console.log(`App listening on http://localhost:${PORT}`)
  console.log('Press CTRL+C to quit.')
} catch (err) {
  app.log.error(err)
  console.log(err)
  process.exit(1)
}
