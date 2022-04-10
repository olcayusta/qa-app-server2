export interface Answer {
  id: number
  content: string
  creationTime: Date
  userId: number
  questionId: number
  rawContent: string
  receiverId?: number
}
