'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  initialUser: {
    id: string
    email?: string
    user_metadata?: { display_name?: string }
  } | null
}

export function UserMenu({ initialUser }: UserMenuProps) {
  const [user, setUser] = useState(initialUser)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // 监听认证状态变化
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user as any)
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsOpen(false)
    router.refresh()
  }

  // 生成头像颜色
  const getAvatarColor = (name: string) => {
    const colors = [
      'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      'linear-gradient(135deg, #ec4899, #f472b6)',
      'linear-gradient(135deg, #06b6d4, #67e8f9)',
      'linear-gradient(135deg, #10b981, #34d399)',
      'linear-gradient(135deg, #f59e0b, #fbbf24)',
      'linear-gradient(135deg, #ef4444, #f87171)',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="btn btn-primary btn-sm"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
        </svg>
        登录
      </Link>
    )
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || '用户'

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 6px 6px 14px',
          background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-full)',
          fontSize: '14px',
          cursor: 'pointer',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
          transition: 'all 0.2s',
        }}
      >
        <span
          style={{
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          {displayName}
        </span>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: getAvatarColor(displayName),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
            }}
            onClick={() => setIsOpen(false)}
          />
          {/* 下拉菜单 */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)',
              boxShadow: 'var(--shadow-xl)',
              minWidth: '200px',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--border-secondary)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: getAvatarColor(displayName),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 600,
                  marginBottom: '12px',
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  marginBottom: '4px',
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-tertiary)',
                }}
              >
                {user.email}
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                cursor: 'pointer',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'background-color 0.2s',
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
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  )
}
