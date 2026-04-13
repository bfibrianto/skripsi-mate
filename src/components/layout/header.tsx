'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  BookOpen,
  LogOut,
  User,
  LayoutDashboard,
} from 'lucide-react'

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => data?.user && setUser(data.user))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Berhasil logout')
      router.push('/login')
    } catch {
      toast.error('Gagal logout')
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            SkripsiMate
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/dashboard">
            <Button
              variant={pathname === '/dashboard' ? 'secondary' : 'ghost'}
              size="sm"
              className={`gap-2 ${pathname === '/dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'}`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold shadow-md">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-500 leading-tight">{user?.email}</p>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}