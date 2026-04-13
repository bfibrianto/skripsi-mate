'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, ArrowRight, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [isLoading, setIsLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password minimal 8 karakter')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Reset password gagal')
        return
      }

      toast.success('Password berhasil direset!')
      router.push('/login')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <Card className="border-slate-200/60 shadow-xl shadow-blue-600/5 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-6 px-8">
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-600/20">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Link Tidak Valid</h1>
            <p className="text-slate-500 text-sm mb-6">
              Token reset password tidak ditemukan atau sudah kadaluarsa.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/forgot-password">
                <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white font-medium">
                  Minta Link Baru
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full h-11">
                  Kembali ke Login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200/60 shadow-xl shadow-blue-600/5 bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-8 pb-6 px-8">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <KeyRound className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Masukkan password baru untuk akun Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
              Password Baru
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Minimal 8 karakter"
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
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
              placeholder="Ulangi password baru"
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
                Mereset...
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-slate-200/60 shadow-xl shadow-blue-600/5 bg-white/80 backdrop-blur-sm">
          <CardContent className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}