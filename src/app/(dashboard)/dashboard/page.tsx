'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type ProjectStatus = 'DRAFT' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Project {
  id: string
  title: string
  purpose: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  documents: { id: string }[]
  analysis: { status: string } | null
}

interface User {
  id: string
  name: string
  email: string
}

function getStatusIcon(status: ProjectStatus) {
  switch (status) {
    case 'DRAFT':
      return <FileText className="h-4 w-4" />
    case 'UPLOADING':
    case 'PROCESSING':
      return <Loader2 className="h-4 w-4 animate-spin" />
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />
    case 'FAILED':
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

function getStatusLabel(status: ProjectStatus) {
  switch (status) {
    case 'DRAFT':
      return 'Draft'
    case 'UPLOADING':
      return 'Mengunggah'
    case 'PROCESSING':
      return 'Memproses'
    case 'COMPLETED':
      return 'Selesai'
    case 'FAILED':
      return 'Gagal'
    default:
      return status
  }
}

function getStatusColor(status: ProjectStatus) {
  switch (status) {
    case 'DRAFT':
      return 'secondary'
    case 'UPLOADING':
    case 'PROCESSING':
      return 'default'
    case 'COMPLETED':
      return 'outline'
    case 'FAILED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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
      toast.error('Failed to load projects')
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
        toast.error(data.error || 'Failed to create project')
        return
      }

      toast.success('Project created successfully')
      setIsCreateDialogOpen(false)
      setNewProject({ title: '', purpose: '' })
      fetchProjects()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Selamat datang, {user?.name || 'User'}</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
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
          <form onSubmit={handleCreateProject} className="space-y-4">
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
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Buat Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Belum ada project</h3>
          <p className="text-slate-600 mb-4">Buat project baru untuk memulai analisis sitasi</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                    <Badge variant={getStatusColor(project.status) as any}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1">{getStatusLabel(project.status)}</span>
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {project.purpose}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{project.documents.length} file</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(project.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}