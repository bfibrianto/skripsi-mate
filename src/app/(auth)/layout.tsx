import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              SkripsiMate
            </span>
          </Link>
        </div>
      </header>

      <main className="relative flex items-center justify-center px-6 py-12 min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-white pointer-events-none" />
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-400/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-400/8 rounded-full blur-3xl" />
        <div className="relative w-full max-w-md">
          {children}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  )
}