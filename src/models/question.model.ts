import { Answer } from './answer.model'
import { Comment } from './comment.model'
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
  answers?: Answer[]
  comments?: Comment[]
}
