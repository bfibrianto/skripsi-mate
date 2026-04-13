import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Brain,
  FileText,
  CheckCircle,
  Upload,
  Search,
  BarChart3,
  Shield,
  Zap,
  GraduationCap,
  BookOpen,
  Sparkles,
} from 'lucide-react'

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            SkripsiMate
          </span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white">
              Daftar Gratis
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-indigo-50/40 to-white pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        <Badge className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border-blue-200/60 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Citation Analysis
        </Badge>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Bantu Kerjakan
          </span>
          <br />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Skripsi
          </span>
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            {' '}dengan AI
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Analisis keselarasan argumen dalam paper Anda dengan sumber referensi secara otomatis.
          Hemat waktu, dapatkan hasil yang akurat.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 h-12 shadow-xl shadow-blue-600/25 text-white"
            >
              Mulai Sekarang
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 h-12 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Pelajari Lebih Lanjut
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Gratis untuk mahasiswa</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span>Data aman & terenkripsi</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Hasil dalam hitungan menit</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: FileText,
      title: 'Buat Project',
      description: 'Masukkan judul dan tujuan paper Anda. Sistem akan menyiapkan workspace khusus.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      number: '02',
      icon: Upload,
      title: 'Upload Dokumen',
      description: 'Upload draft paper dan dokumen referensi. Mendukung PDF dan DOCX secara bersamaan.',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      number: '03',
      icon: Brain,
      title: 'Analisis AI',
      description: 'AI menganalisis keselarasan argumen dengan referensi menggunakan vector database.',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      number: '04',
      icon: BarChart3,
      title: 'Lihat Hasil',
      description: 'Dapatkan laporan detail mencakup skor, sitasi yang cocok, dan rekomendasi perbaikan.',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-slate-600 border-slate-300">
            Cara Kerja
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Empat Langkah Mudah
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Dari upload dokumen hingga dapatkan hasil analisis, semuanya berjalan otomatis.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(100%_-_1rem)] w-8 border-t-2 border-dashed border-slate-200" />
              )}
              <Card className={`border ${step.borderColor} ${step.bgColor}/50 hover:shadow-lg transition-all duration-300 h-full`}>
                <CardContent className="pt-6">
                  <span className={`text-xs font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                    STEP {step.number}
                  </span>
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center my-4 shadow-lg`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: 'Citation Matching',
      description:
        'AI mencocokkan setiap argumen dalam paper Anda dengan sumber referensi yang digunakan, mengidentifikasi kesesuaian dan ketidaksesuaian.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'Analisis Cerdas',
      description:
        'Menggunakan vector database dan semantic search untuk memahami konteks argumen secara mendalam, bukan sekadar pencocokan kata.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Skor & Metrik',
      description:
        'Dapatkan skor keselarasan keseluruhan beserta breakdown detail per argumen dan referensi.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: FileText,
      title: 'Rekomendasi',
      description:
        'Sistem memberikan saran perbaikan untuk argumen yang tidak selaras, termasuk referensi yang mungkin lebih tepat.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Upload,
      title: 'Upload Paralel',
      description:
        'Upload draft paper dan banyak dokumen referensi sekaligus. File disimpan aman di Google Drive.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Shield,
      title: 'Privasi Terjamin',
      description:
        'Semua credential disimpan server-side. Dokumen Anda tersimpan aman dan hanya bisa diakses oleh Anda.',
      gradient: 'from-rose-500 to-red-500',
    },
  ]

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-slate-600 border-slate-300">
            Fitur Lengkap
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Semua yang Anda Butuhkan
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Tool yang dirancang khusus untuk kebutuhan analisis sitasi skripsi dan paper akademik.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-slate-200/80 hover:border-slate-300 hover:shadow-xl transition-all duration-300 bg-white"
            >
              <CardContent className="pt-6">
                <div
                  className={`h-11 w-11 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-10 sm:p-14 text-center overflow-hidden shadow-2xl shadow-blue-600/20">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptMC0zMHY2aC02VjRoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <GraduationCap className="h-4 w-4" />
              Gratis untuk Mahasiswa
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Siap Memulai Analisis?
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-lg mx-auto">
              Buat akun sekarang dan mulai verifikasi sitasi skripsi Anda secara otomatis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 h-12 shadow-xl font-semibold"
                >
                  Daftar Sekarang
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 h-12 border-white/30 text-primary hover:bg-white/10 backdrop-blur-sm"
                >
                  Sudah Punya Akun
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">SkripsiMate</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="hover:text-slate-900 transition-colors">
              Daftar
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} SkripsiMate. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CtaSection />
      <Footer />
    </div>
  )
}