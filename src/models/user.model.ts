export interface User {
  id: number
  displayName: string
  picture: string
  signupDate: Date
  lastSeenTime: Date
  githubUrl?: string
  twitterUrl?: string
  token?: string
}
