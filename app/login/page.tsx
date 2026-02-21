'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true) // true=登录, false=注册
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  // 检查是否已登录
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/')
      }
    }
    checkUser()
  }, [])

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: '请输入邮箱和密码' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) throw error

      if (data.user) {
        router.push('/')
        router.refresh()
      }
    } catch (error: any) {
      console.error('登录失败:', error)
      setMessage({
        type: 'error',
        text: error.message || '邮箱或密码错误',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 处理注册
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      setMessage({ type: 'error', text: '请输入邮箱和密码' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: '密码至少需要 6 位' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      })

      if (error) throw error

      if (data.user) {
        if (data.session) {
          // 自动登录成功
          setMessage({ type: 'success', text: '注册成功！' })
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 500)
        } else {
          // 需要邮箱确认
          setMessage({
            type: 'success',
            text: '注册成功！请检查邮箱确认链接（如不需要确认则直接登录）',
          })
        }
      }
    } catch (error: any) {
      console.error('注册失败:', error)
      setMessage({
        type: 'error',
        text: error.message || '注册失败，邮箱可能已存在',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              🎵
            </div>
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              每日音乐
            </span>
          </Link>
        </div>

        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* 背景装饰 */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px' }}>
                {isLogin ? '欢迎回来' : '创建账户'}
              </h1>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '15px' }}>
                {isLogin ? '登录以继续你的音乐之旅' : '注册开始发现好音乐'}
              </p>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  邮箱地址
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input"
                    disabled={isLoading}
                    required
                    style={{ paddingLeft: '44px' }}
                  />
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor="password"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                  }}
                >
                  密码
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位"
                    className="input"
                    disabled={isLoading}
                    required
                    minLength={6}
                    style={{ paddingLeft: '44px' }}
                  />
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
              </div>

              {message && (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '20px',
                    fontSize: '14px',
                    backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
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
                    {message.type === 'success' ? (
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3" />
                    ) : (
                      <circle cx="12" cy="12" r="10" />
                    )}
                    {message.type === 'error' && (
                      <>
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </>
                    )}
                  </svg>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  marginBottom: '12px',
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animation: 'spin 1s linear infinite' }}
                    >
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    处理中...
                  </>
                ) : (
                  isLogin ? '登 录' : '注 册'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setMessage(null)
                }}
                disabled={isLoading}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                }}
              >
                {isLogin ? '没有账户？去注册 →' : '已有账户？去登录 →'}
              </button>
            </form>

            <div className="divider" />

            <div
              style={{
                padding: '16px',
                background: 'var(--bg-glass)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--text-tertiary)',
                lineHeight: 1.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                使用提示
              </div>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>新用户请直接输入邮箱密码点击注册</li>
                <li>老用户直接输入邮箱密码登录</li>
                <li>密码至少需要 6 位字符</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link
            href="/"
            className="btn btn-ghost btn-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            返回首页
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  )
}

// 带 Suspense 边界的页面组件
export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>🎵</div>
          <p style={{ color: 'var(--text-tertiary)' }}>加载中...</p>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
