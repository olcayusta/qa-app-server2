import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import uaParser from 'ua-parser-js'
import { Tag } from '@shared/tag.model'
import { QueryConfig } from 'pg'

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
