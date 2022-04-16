import { Comment } from "./comment.model"
import { User } from "./user.model"

export interface Answer {
  id: number
  content: string
  creationTime: Date
  userId: number
  questionId: number
  rawContent: string
  receiverId?: number
  user?: User
  comments?: Comment[]
}
