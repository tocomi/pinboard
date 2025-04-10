export interface PinboardItem {
  id: string
  title: string
  deadline?: number
  tags: string[]
  completed: boolean
  order: number
}
