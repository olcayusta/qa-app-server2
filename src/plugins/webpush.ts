import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import webPush, { PushSubscription } from 'web-push'

const subscriptions: PushSubscription[] = []

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

    for (const subscription of subscriptions) {
      await webPush.sendNotification(
        subscription,
        JSON.stringify(payload)
      )
    }

    return { hello: 'world' }
  })
})
