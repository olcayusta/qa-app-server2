import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export default async function (app: FastifyInstance) {
    app.addHook('preHandler', (req: FastifyRequest, reply: FastifyReply, done) => {
        console.log('Oki toki')
    })
}
