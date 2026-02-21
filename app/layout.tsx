import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '每日音乐推荐',
  description: '每天推荐一首好歌',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
