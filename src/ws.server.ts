import { WebSocket, WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import { IncomingMessage } from 'http'
import { User } from '@shared/user.model'

export const sids: Map<string, Set<string>> = new Map()

class CustomWebSocket extends WebSocket {
  id: string = nanoid(8)

  join(room: string) {
    this.joinSids(room)

    if (!wss.rooms.has(room)) {
      wss.rooms.set(room, new Set())
      wss.rooms.get(room)?.add(this.id)
    }

    wss.rooms.get(room)?.add(this.id)
  }

  joinSids(room: string) {
    if (!sids.has(this.id)) {
      sids.set(this.id, new Set())
      sids.get(this.id)?.add(room)
    }

    sids.get(this.id)?.add(room)
  }

  leave(room: string) {
    this.leaveSids(room)
    if (wss.rooms.has(room)) {
      wss.rooms.get(room)?.delete(this.id)

      if (!wss.rooms.get(room)?.size) {
        wss.rooms.delete(room)
      }
    }
  }

  leaveSids(room: string) {
    if (sids.has(this.id)) {
      sids.get(this.id)?.delete(room)

      if (!sids.get(this.id)?.size) {
        sids.delete(this.id)
      }
    }
  }
}

/*class CustomWebSocketServer<T extends CustomWebSocket> extends WebSocketServer {
  rooms: Set<string>
}

class CustomWebSocketServer extends WebSocketServer {
  rooms: Set<string>
}

const wss: WebSocketServer = new CustomWebSocketServer({
  noServer: true,
  WebSocket: CustomWebSocket
})*/

const wss: WebSocketServer = new WebSocketServer<CustomWebSocket>({
  noServer: true,
  WebSocket: CustomWebSocket
})

wss.rooms = new Map();

wss.on('connection', async (ws: WebSocket, request: IncomingMessage, client: User) => {

  // User join the room with user id
  if (client.id) {
    ws.join(`u:${client.id}`)
  } else {
    ws.join('users')
  }

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
      console.log('Subscribe to the room')
      console.log(wss.rooms)
    }

    if (unsubscribe) {
      ws.leave(unsubscribe)
      console.log('Unsubscribe to the room')
    }
  })

  ws.on('close', () => {
    ws.leave(`u:${client.id}`)
    ws.leave(`users`)
    ws.leave(`home`)

    if (wss.rooms.has('home')) {
      wss.rooms.get('home')?.delete(ws.id)
    }

    console.log(sids)

    console.log(wss.rooms)
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
