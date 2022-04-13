import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import uaParser from 'ua-parser-js'

const root: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get('/', async function({ headers }) {
    const ua = uaParser(headers['user-agent'])
    return {
      root: true,
      info: ua
    }
  })
}

export default root
