export interface PinboardItem {
  id: string
  title: string
  deadline?: Date
  tags?: string[]
  completed: boolean
  order: number
}
