import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import webPush, { PushSubscription } from 'web-push'

const subscriptions: PushSubscription[] = []

export default fp(async (app: FastifyInstance) => {
  webPush.setVapidDetails(
    'mailto:you@domain.com',
    process.env.PUBLIC_VAPID!,
    process.env.PRIVATE_VAPID!
  )

  app.post<{
    Body: PushSubscription
  }>('/subscription', async ({ body }) => {
    subscriptions.push(body)
  })

  app.get('/api/trigger-push-msg', async () => {
    const notificationPayload = {
      notification: {
        title: 'New Notification',
        body: 'This is the body of the notifications',
        icon: 'assets/icons/icon-512x512.png'
      }
    }

    for (let subscription of subscriptions) {
      await webPush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      )
    }

    return { hello: 'world' }
  })
})
