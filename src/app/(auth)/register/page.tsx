'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }

    if (password.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Registrasi gagal')
        return
      }

      toast.success('Registrasi berhasil!')
      router.push('/dashboard')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-200/60 shadow-xl shadow-blue-600/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-8 pb-6 px-8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Akun Baru</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Mulai analisis sitasi paper Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Nama Lengkap
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              required
              className="h-11 bg-white/60 border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="h-11 bg-white/60 border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="h-11 bg-white/60 border-slate-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Konfirmasi Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              required
              className="h-11 bg-white/60 border-slate-200"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Membuat akun...
              </>
            ) : (
              <>
                Daftar
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-slate-400 mt-4 text-center leading-relaxed">
          Dengan mendaftar, Anda menyetujui ketentuan layanan dan kebijakan privasi kami.
        </p>

        <div className="mt-5 pt-5 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Masuk
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}