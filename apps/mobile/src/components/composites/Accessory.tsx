import type { ReactNode } from 'react'

type AccessoryProps = {
  children: ReactNode
  height?: number
  order?: number
}

export function Accessory({ children, height, order }: AccessoryProps) {
  void children
  void height
  void order
  return null
}
