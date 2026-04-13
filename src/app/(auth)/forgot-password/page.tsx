'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Gagal mengirim email')
        return
      }

      setEmailSent(true)
      toast.success('Link reset password telah dikirim')
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="border-slate-200/60 shadow-xl shadow-blue-600/5 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-8 pb-6 px-8">
          <div className="text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Cek Email Anda</h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Kami telah mengirim link reset password ke<br />
              <span className="font-medium text-slate-700">{email}</span>
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500 leading-relaxed">
                Tidak menerima email? Cek folder spam atau tunggu beberapa menit lalu coba lagi.
              </p>
            </div>
            <Link href="/login">
              <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white font-medium">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Login
              </Button>
            </Link>
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
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lupa Password?</h1>
          <p className="text-slate-500 mt-1.5 text-sm leading-relaxed">
            Masukkan email yang terdaftar. Kami akan mengirim link untuk mereset password Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Link Reset'
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