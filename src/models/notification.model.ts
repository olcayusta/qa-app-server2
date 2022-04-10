export interface Notification {
  id: number
  senderId: number
  receiverId: number
  text: string
  type: number
  creationTime: Date
  isRead: Date
}
