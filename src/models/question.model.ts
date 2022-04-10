import { User } from './user.model'

export interface Question {
  id: number
  title: string
  content: string
  text: string
  creationTime: Date
  userId: number
  viewCount: number
  tags: number[]
  user: User
}
