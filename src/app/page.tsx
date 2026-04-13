import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, Brain, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="text-xl font-bold text-slate-900">SkripsiMate</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700">Daftar</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Brain className="h-4 w-4" />
              AI-Powered Citation Analysis
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Bantu Kerjakan Skripsi<br />
              dengan <span className="text-blue-600">AI</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              SkripsiMate membantu mahasiswa menganalisis keselarasan argumen dalam paper 
              dengan sumber referensi menggunakan teknologi AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-slate-50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Fitur Utama
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Upload Dokumen</CardTitle>
                </CardHeader>
                <CardDescription>
                  Upload draft paper dan dokumen referensi dengan mudah ke Google Drive.
                </CardDescription>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Analisis Otomatis</CardTitle>
                </CardHeader>
                <CardDescription>
                  AI menganalisis keselarasan argumen dengan sumber referensi secara otomatis.
                </CardDescription>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>Laporan Detail</CardTitle>
                </CardHeader>
                <CardDescription>
                  Dapatkan laporan lengkap mengenai sitasi dan rekomendasi perbaikan.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Siap Memulai?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Buat akun gratis dan mulai analisis sitasi skripsi Anda hari ini.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Daftar Sekarang
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center text-slate-600">
          <p>&copy; 2026 SkripsiMate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}