import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from 'fastify'
import { wss } from '../../ws.server.js'
import fp from 'fastify-plugin'

/*export default async (app: FastifyInstance) => {
  app.get('/', async (req, res) => {
    wss.clients.forEach((ws) => {
      ws.send(JSON.stringify({
        event: 'new status',
        payload: {
          userId: 1001,
          message: 'Yeni bir makale eklendi'
        }
      }))
    })
    return {
      status: true
    }
  })
}*/

const statusRoute: FastifyPluginAsync = async (app: FastifyInstance, options: FastifyPluginOptions) => {
  app.get('/', async (req, res) => {
    wss.clients.forEach((ws) => {
      ws.send(JSON.stringify({
        event: 'new status',
        payload: {
          userId: 1001,
          message: 'Yeni bir makale eklendi'
        }
      }))
    })
    return {
      status: true
    }
  })
}

export default statusRoute
