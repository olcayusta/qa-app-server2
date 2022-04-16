import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import webPush, { PushSubscription } from 'web-push'

const subscriptions: PushSubscription[] = []

export default fp(async (fastify: FastifyInstance) => {
  webPush.setVapidDetails(
    'mailto:you@domain.com',
    process.env.PUBLIC_VAPID!,
    process.env.PRIVATE_VAPID!
  )

  fastify.post<{
    Body: PushSubscription
  }>('/subscription', async function({ body }) {
    subscriptions.push(body)
  })

  fastify.get('/api/trigger-push-msg', async function() {
    const payload = {
      notification: {
        title: 'New Notification',
        body: 'This is the body of the notifications',
        icon: 'assets/icons/icon-512x512.png'
      }
    }

    for (let subscription of subscriptions) {
      await webPush.sendNotification(
        subscription,
        JSON.stringify(payload)
      )
    }

    return { hello: 'world' }
  })
})
