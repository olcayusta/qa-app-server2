import fastify, { FastifyInstance } from 'fastify'
import fastifyEnv from 'fastify-env'
import fastifyAutoload from 'fastify-autoload'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app: FastifyInstance = fastify()

/**
 * Wait for the environment to be loaded
 */
await app.register(fastifyEnv, {
  schema: {
    type: 'object'
  },
  dotenv: true
})

/*const client = createClient()
client.on('error', (err) => console.log('Redis Client Error', err))
await client.connect()*/

/**
 * Register Autoload plugins and load all plugins in the plugins directory
 */
app.register(fastifyAutoload, {
  dir: join(__dirname, 'plugins'),
  forceESM: true
})

/**
 * Fastify plugin to load all routes from a directory
 */
app.register(fastifyAutoload, {
  dir: join(__dirname, 'routes'),
  forceESM: true,
  routeParams: true
})

export {
  app
}
