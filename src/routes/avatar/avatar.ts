import { FastifyInstance, FastifyReply } from 'fastify'

export default async (app: FastifyInstance) => {
  app.get<{
    Querystring: {
      username: string
    }
  }>('/default', async ({ query }, reply: FastifyReply) => {
    const { username } = query
    const [firstName, lastName] = username.split(' ')

    const tspan = lastName ? firstName.charAt(0) + lastName.charAt(0) : firstName.charAt(0)

    const html = `
                <svg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'>
                    <defs>
                        <linearGradient id='gradient' x1='0' y1='0' x2='0' y2='1'>
                            <stop stop-color='#606060' offset='0'/>
                            <stop stop-color='#212121' offset='1'/>
                        </linearGradient>
                    </defs>
                    <g>
                        <rect fill='url(#gradient)'
                              x='0' y='0' width='40' height='40'
                              rx='0' ry='0'/>
                        <text x='50%' y='50%' text-anchor='middle' dominant-baseline='central'
                              font-family='Archivo, Helvetica, sans-serif'
                              font-weight='500'
                              font-size='16px'
                              letter-spacing='1'
                              fill='#FFFFFF'>
                            <tspan>${tspan}</tspan>
                           <!-- <tspan x='6' y='28'>_</tspan>-->
                        </text>
                    </g>
                </svg>
                `
    reply.type('image/svg+xml').send(html)
  })
}
