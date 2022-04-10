import { WebSocket, WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import { IncomingMessage } from 'http'

export const sids = new Map() // adding "the-room" to the Set identified by the socket ID
export const rooms: Map<string, Set<string>> = new Map<string, Set<string>>() // adding the socket ID in the Set identified by the string "the-room"

class CustomWebSocket extends WebSocket {
  id: string = nanoid(8)

  join(room: string) {
    if (rooms.has(room)) {
      rooms.get(room)?.add(this.id)
    } else {
      rooms.set(room, new Set())
      rooms.get(room)?.add(this.id)
    }
  }

  leave(room: string) {
    if (rooms.has(room)) {
      rooms.get(room)?.delete(this.id)

      if (!rooms.get(room)?.size) {
        rooms.delete(room)
      }
    }
  }
}

/*class CustomWebSocketServer<T extends CustomWebSocket> extends WebSocketServer {
  odalar: Set<string>
}

class CustomWebSocketServer extends WebSocketServer {
  odalar: Set<string>
}

const wss: WebSocketServer = new CustomWebSocketServer({
  noServer: true,
  WebSocket: CustomWebSocket
})*/

const wss: WebSocketServer = new WebSocketServer<CustomWebSocket>({
  noServer: true,
  WebSocket: CustomWebSocket
})

wss.on('connection', async (ws: WebSocket, request: IncomingMessage, client: any) => {
  ws.id = nanoid(8)

  setTimeout(() => {
    if (client.id) {
      ws.join(`u:${client.id}`)
    } else {
      ws.join('users')
    }
    console.log(rooms)
  }, 1000)

  // sids.set(ws.id, new Set().add('room1').add('room2'))
  // console.log(sids.get(ws.id))

  ws.on('message', (data: string) => {
    const { event, ...payload } = JSON.parse(data)
    ws.emit(event, payload)
  })

  ws.on('watch', (data) => {
    const { subscribe, unsubscribe } = data
    if (subscribe) {
      ws.join(subscribe)
    }

    if (unsubscribe) {
      ws.leave(unsubscribe)
    }
  })

  ws.on('close', () => {
    ws.leave(`u:${client.id}`)
    ws.leave(`users`)
    ws.leave(`home`)

    if (rooms.has('home')) {
      rooms.get('home')?.delete(ws.id)
    }

    console.log(rooms)
    // console.log('socket is disconnect')
    /*		Object.keys(rooms).forEach((value, index) => {
      const room = rooms[value]

      room.forEach((client) => {
        if (client === ws) {
          rooms[value].delete(client)
        }
      })
    })*/
  })
})

export { wss }
