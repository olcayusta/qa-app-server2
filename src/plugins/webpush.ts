import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import webPush, { PushSubscription } from 'web-push'

function sendNotifications(subscriptions: PushSubscription[]) {
  const notification = JSON.stringify({
    notification: {
      title: 'Hello, Notifications!',
      options: {
        body: `ID: ${Math.floor(Math.random() * 100)}`
      }
    }
  })
  const options = {
    TTL: 10000
  }
  subscriptions.forEach(subscription => {
    const endpoint = subscription.endpoint
    const id = endpoint.substring((endpoint.length - 8), endpoint.length)
    webPush.sendNotification(subscription, notification, options)
      .then(result => {
        console.log(`Endpoint ID: ${id}`)
        console.log(`Result: ${result.statusCode}`)
      })
      .catch(error => {
        console.log(`Endpoint ID: ${id}`)
        console.log(`Error: ${error} `)
      })
  })
}

const subscriptions: Map<string, PushSubscription> = new Map()

export default fp(async (fastify: FastifyInstance) => {
  const PUBLIC_VAPID = process.env.PUBLIC_VAPID
  const PRIVATE_VAPID = process.env.PRIVATE_VAPID
  if (PUBLIC_VAPID && PRIVATE_VAPID) {
    webPush.setVapidDetails(
      'http://localhost:4200',
      PUBLIC_VAPID,
      PRIVATE_VAPID
    )
  }

  fastify.post<{
    Body: PushSubscription
  }>('/subscription', async function({ body }) {
    console.log(`Subscribing ${body.endpoint}`)
    subscriptions.set(body.endpoint, body)
    console.log(subscriptions.size)
    return {}
  })

  fastify.post<{
    Body: PushSubscription
  }>('/add-subscription', async function({ body }) {
    console.log(`Subscribing ${body.endpoint}`)
    subscriptions.set(body.endpoint, body)
    console.log(subscriptions.size)
    return {}
  })

  fastify.post<{
    Body: PushSubscription
  }>('/remove-subscription', async function({ body }) {
    console.log(`Unsubscribing ${body.endpoint}`)
    subscriptions.delete(body.endpoint)
    return {}
  })

  fastify.get<{
    Body: PushSubscription
  }>('/notify-me', async function({ body }) {
    console.log(`Notifying ${body.endpoint}`)
    const subscription = subscriptions.get(body.endpoint)
    sendNotifications([subscription!])
    return {}
  })

  fastify.get('/api/trigger-push-msg', async function() {
    const payload = {}

    const notification = JSON.stringify({
      notification: {
        title: 'Portugal vs. Denmark',
        body: 'great match!',
        // icon: 'assets/icons/icon-512x512.png',
        icon: 'https://i.imgur.com/E15XAUC.png',
        options: {
          body: `ID: ${Math.floor(Math.random() * 100)}`
        }
      }
    })

    for (const subscription of subscriptions.values()) {
      const endpoint = subscription.endpoint
      const id = endpoint.substring((endpoint.length - 8), endpoint.length)

      try {
        const { statusCode } = await webPush.sendNotification(
          subscription,
          notification,
          {
            TTL: 10000
          }
        )

        console.log(`Endpoint ID: ${id}`)
        console.log(`Result: ${statusCode}`)
      } catch (e) {
        subscriptions.delete(endpoint)
        console.log(e)
        console.log(`Endpoint ID: ${id}`)
        console.log(`Error: ${e} `)
      }
    }

    return { hello: 'world' }
  })
})
