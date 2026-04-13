'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  FolderOpen,
  Sparkles,
  FileUp,
  BarChart3,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'

type ProjectStatus = 'DRAFT' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Project {
  id: string
  title: string
  purpose: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  documents: { id: string; fileType: string }[]
  analysis: { status: string } | null
}

interface User {
  id: string
  name: string
  email: string
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  const config: Record<ProjectStatus, { label: string; icon: React.ReactNode; className: string }> = {
    DRAFT: {
      label: 'Draft',
      icon: <FileText className="h-3 w-3" />,
      className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    UPLOADING: {
      label: 'Mengunggah',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    PROCESSING: {
      label: 'Memproses',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    COMPLETED: {
      label: 'Selesai',
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    FAILED: {
      label: 'Gagal',
      icon: <XCircle className="h-3 w-3" />,
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  }

  const { label, icon, className } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      {icon}
      {label}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({ title: '', purpose: '' })

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setUser(data.user)
    } catch {
      router.push('/login')
    }
  }, [router])

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()
      setProjects(data.projects)
    } catch {
      toast.error('Gagal memuat project')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
    fetchProjects()
  }, [fetchUser, fetchProjects])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Gagal membuat project')
        return
      }

      toast.success('Project berhasil dibuat')
      setIsCreateDialogOpen(false)
      setNewProject({ title: '', purpose: '' })
      fetchProjects()
      router.push(`/projects/${data.project.id}`)
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    setDeletingId(projectId)
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Gagal menghapus project')
        return
      }
      toast.success('Project berhasil dihapus')
      fetchProjects()
    } catch {
      toast.error('Gagal menghapus project')
    } finally {
      setDeletingId(null)
      setShowDeleteConfirm(null)
    }
  }

  const stats = {
    total: projects.length,
    drafts: projects.filter(p => p.status === 'DRAFT').length,
    processing: projects.filter(p => p.status === 'PROCESSING' || p.status === 'UPLOADING').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Selamat datang, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-500 mt-1">Kelola project dan analisis sitasi paper Anda</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Project Baru
        </Button>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat Project Baru</DialogTitle>
            <DialogDescription>
              Masukkan judul dan tujuan paper Anda untuk memulai project baru.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Paper</Label>
              <Input
                id="title"
                placeholder="Contoh: Analisis Sistem Informasi Manajemen"
                value={newProject.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">Tujuan Paper</Label>
              <Textarea
                id="purpose"
                placeholder="Jelaskan tujuan dan fokus penelitian Anda..."
                value={newProject.purpose}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewProject({ ...newProject, purpose: e.target.value })
                }
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  'Buat Project'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {projects.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200/60 bg-white">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                  <p className="text-xs text-slate-500">Total Project</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 bg-white">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.drafts}</p>
                  <p className="text-xs text-slate-500">Draft</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 bg-white">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Loader2 className={`h-5 w-5 text-amber-600 ${stats.processing > 0 ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.processing}</p>
                  <p className="text-xs text-slate-500">Memproses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200/60 bg-white">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                  <p className="text-xs text-slate-500">Selesai</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white">
          <CardContent className="py-20">
            <div className="text-center max-w-sm mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Mulai Project Pertama Anda
              </h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Buat project baru untuk mulai menganalisis keselarasan argumen dalam paper Anda dengan sumber referensi.
              </p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Buat Project Pertama
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Project Anda</h2>
            <span className="text-sm text-slate-500">{projects.length} project</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const draftCount = project.documents.filter(d => d.fileType === 'DRAFT').length
              const refCount = project.documents.filter(d => d.fileType === 'REFERENCE').length
              const hasAnalysis = project.analysis !== null
              const isProcessing = project.status === 'PROCESSING' || project.status === 'UPLOADING'

              return (
                <div key={project.id} className="group relative">
                  <Link href={`/projects/${project.id}`} className="block h-full">
                    <Card className="border-slate-200/60 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 h-full">
                      <CardContent className="pt-5 pb-4 px-5">
                        <div className="flex items-start justify-between mb-3">
                          <StatusBadge status={project.status} />
                          <div
                            role="button"
                                                            onClick={(e: React.MouseEvent) => {
                             e.preventDefault()
                             e.stopPropagation()
                             setShowDeleteConfirm(showDeleteConfirm === project.id ? null : project.id)
                           }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </div>
                        </div>

                        <h3 className="font-semibold text-slate-900 mb-1.5 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                          {project.purpose}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <FileUp className="h-3.5 w-3.5" />
                              {draftCount + refCount} file
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDate(project.createdAt)}
                            </span>
                          </div>
                          {isProcessing && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                          {project.status === 'COMPLETED' && (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <BarChart3 className="h-3.5 w-3.5" />
                              Hasil
                            </span>
                          )}
                          {project.status === 'DRAFT' && (
                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {showDeleteConfirm === project.id && (
                    <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-sm rounded-xl border border-red-200 shadow-xl flex items-center justify-center p-6">
                      <div className="text-center">
                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-1">Hapus project?</p>
                        <p className="text-xs text-slate-500 mb-4">Tindakan ini tidak dapat dibatalkan</p>
                        <div className="flex items-center gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowDeleteConfirm(null)
                            }}
                          >
                            Batal
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={deletingId === project.id}
                            onClick={(e: React.MouseEvent) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDeleteProject(project.id)
                            }}
                          >
                            {deletingId === project.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Hapus'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}