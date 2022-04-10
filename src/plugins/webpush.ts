import fp from 'fastify-plugin'
import webPush, { PushSubscription } from 'web-push'

const subscriptions: PushSubscription[] = []

export default fp(async (app) => {
	webPush.setVapidDetails(
		'mailto:you@domain.com',
		process.env.PUBLIC_VAPID!,
		process.env.PRIVATE_VAPID!
	)

	app.post<{
    Body: PushSubscription
  }>('/subscription', async (req) => {
		const subscription = req.body
		subscriptions.push(subscription)
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
			await webPush.sendNotification(subscription, JSON.stringify(notificationPayload))
		}

		return { hello: 'world' }
	})
})
