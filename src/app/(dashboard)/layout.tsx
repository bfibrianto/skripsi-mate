import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  )
}