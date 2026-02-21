// 格式化日期为 YYYY-MM-DD
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化时间戳为本地时间
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 从 QQ 音乐链接提取 ID
export function extractQQMusicId(url: string): string | null {
  // 尝试匹配 songmid 参数
  const match = url.match(/songmid=([^&]+)/)
  return match ? match[1] : null
}

// 构建 QQ 音乐嵌入链接
export function getQQMusicEmbedUrl(songmid: string): string {
  return `https://y.qq.com/n/ryqq/player/index.html?songmid=${songmid}`
}

// 构建 Bilibili 嵌入链接
export function getBilibiliEmbedUrl(bvid: string, page: number = 1): string {
  return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${page}&high_quality=1&danmaku=0`
}
