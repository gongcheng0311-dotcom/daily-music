import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import type { Song } from '@/types/database'
import { UserMenu } from '@/components/UserMenu'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createClient()
  const today = formatDate(new Date())

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 尝试获取今日推荐
  let { data: todaySong } = await supabase
    .from('songs')
    .select('*')
    .eq('date', today)
    .single()

  // 如果没有今日推荐，获取最新的歌曲
  let targetSong: Song | null = todaySong
  if (!targetSong) {
    const { data: latestSong } = await supabase
      .from('songs')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()
    targetSong = latestSong
  }

  // 获取历史日期列表（排除今日或当前展示的歌曲）
  const { data: historySongs } = await supabase
    .from('songs')
    .select('date, title, artist, cover_url')
    .order('date', { ascending: false })

  const filteredHistory = historySongs?.filter(
    (song) => song.date !== targetSong?.date
  ) || []

  return (
    <main className="container" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
      {/* 导航栏 */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '48px',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            🎵
          </div>
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            每日好歌
          </span>
        </Link>
        <UserMenu initialUser={user as any} />
      </nav>

      {/* 今日/最新推荐 */}
      {targetSong ? (
        <section
          className="card"
          style={{
            marginBottom: '64px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 背景装饰 */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* 标签 */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'center' }}>
              <span className="badge">
                {targetSong.date === today ? '✨ 今日推荐' : `📅 ${targetSong.date}`}
              </span>
            </div>

            {/* 内容区域 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '24px',
              }}
            >
              {/* 封面 */}
              <div
                style={{
                  position: 'relative',
                  width: '280px',
                  height: '280px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl), var(--shadow-glow)',
                }}
              >
                {targetSong.cover_url ? (
                  <img
                    src={targetSong.cover_url}
                    alt={targetSong.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '80px',
                    }}
                  >
                    🎵
                  </div>
                )}
              </div>

              {/* 歌曲信息 */}
              <div style={{ maxWidth: '600px' }}>
                <h1
                  style={{
                    fontSize: 'clamp(28px, 5vw, 40px)',
                    fontWeight: 700,
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  {targetSong.title}
                </h1>

                <p
                  style={{
                    fontSize: '20px',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                    fontWeight: 500,
                  }}
                >
                  {targetSong.artist}
                </p>

                {targetSong.album && (
                  <p
                    style={{
                      fontSize: '15px',
                      color: 'var(--text-tertiary)',
                      marginBottom: '24px',
                    }}
                  >
                    《{targetSong.album}》
                  </p>
                )}

                {targetSong.description && (
                  <p
                    style={{
                      fontSize: '16px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.7,
                      marginBottom: '32px',
                    }}
                  >
                    {targetSong.description}
                  </p>
                )}

                <Link
                  href={`/songs/${targetSong.date}`}
                  className="btn btn-primary btn-lg"
                >
                  查看详情
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '80px 40px',
            marginBottom: '64px',
          }}
        >
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎧</div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>暂无推荐歌曲</h2>
          <p style={{ color: 'var(--text-tertiary)' }}>敬请期待更多精彩内容</p>
        </div>
      )}

      {/* 历史推荐 */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '4px',
              height: '24px',
              background: 'var(--gradient-primary)',
              borderRadius: '2px',
            }}
          />
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            历史推荐
          </h2>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            ({filteredHistory.length} 首)
          </span>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="history-grid">
            {filteredHistory.map((song) => (
              <Link
                key={song.date}
                href={`/songs/${song.date}`}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  textDecoration: 'none',
                }}
              >
                {/* 小封面 */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: song.cover_url ? 'transparent' : 'var(--gradient-secondary)',
                  }}
                >
                  {song.cover_url ? (
                    <img
                      src={song.cover_url}
                      alt={song.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                      }}
                    >
                      🎵
                    </div>
                  )}
                </div>

                {/* 歌曲信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--primary-400)',
                      fontWeight: 600,
                      marginBottom: '6px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {song.date}
                  </div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {song.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-tertiary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {song.artist}
                  </p>
                </div>

                {/* 箭头 */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)' }}
          >
            暂无历史记录
          </div>
        )}
      </section>
    </main>
  )
}
