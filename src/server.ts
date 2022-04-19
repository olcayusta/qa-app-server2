import { app } from './app.js'
import { wss } from './ws.server.js'
import { IncomingMessage } from 'http'
import { Duplex } from 'stream'

app.server.on('upgrade', async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  const { headers } = req
  const protocol = headers['sec-websocket-protocol']

  let client: any = {}
  try {
    await app.jwt.verify(protocol!)
    client = app.jwt.decode(protocol!)
  } catch (error) {
    // FIXME: missing token
    app.log.warn('FIXME: missing token')
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req, client)
  })
})

try {
  const { PORT } = process.env
  await app.listen(PORT!, '0.0.0.0')
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
