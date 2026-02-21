// 数据库类型定义

export interface Song {
  id: string
  date: string
  title: string
  artist: string
  album: string | null
  cover_url: string | null
  description: string | null
  lyrics: string | null
  qq_music_url: string | null
  qq_music_id: string | null
  bilibili_bvid: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Rating {
  id: string
  song_id: string
  user_id: string
  score: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Comment {
  id: string
  song_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface SongWithRatings extends Song {
  average_score?: number
  rating_count?: number
  user_rating?: Rating | null
}
