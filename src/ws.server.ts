import { WebSocket, WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import { IncomingMessage } from 'http'

export const sids: Map<string, Set<string>> = new Map()
export const rooms: Map<string, Set<string>> = new Map()

class CustomWebSocket extends WebSocket {
  id: string = nanoid(8)

  join(room: string) {
    this.joinSids(room)

    if (!wss.odalar.has(room)) {
      wss.odalar.set(room, new Set())
      wss.odalar.get(room)?.add(this.id)
    }

    wss.odalar.get(room)?.add(this.id)
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
    if (wss.odalar.has(room)) {
      wss.odalar.get(room)?.delete(this.id)

      if (!wss.odalar.get(room)?.size) {
        wss.odalar.delete(room)
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

wss.odalar = new Map();

wss.on('connection', async (ws: WebSocket, request: IncomingMessage, client: any) => {
  ws.id = nanoid(8)

  /**
   * User join the room with user id
   */
  if (client.id) {
    ws.join(`u:${client.id}`)
    console.log('Authenticated user joined.')
  } else {
    ws.join('users')
  }
  console.log(wss.odalar)

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
      console.log(wss.odalar)
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

    if (wss.odalar.has('home')) {
      wss.odalar.get('home')?.delete(ws.id)
    }

    console.log(sids)

    console.log('Aktif soketler --- START')
    console.log(wss.odalar)
    console.log('Aktif soketler --- END')
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
