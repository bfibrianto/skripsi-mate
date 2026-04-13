'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Upload, FileText, Play, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type ProjectStatus = 'DRAFT' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
type FileType = 'DRAFT' | 'REFERENCE'
type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Document {
  id: string
  filename: string
  fileType: FileType
  fileSize: number
  googleDriveFileId: string | null
  uploadedAt: string | null
}

interface Project {
  id: string
  title: string
  purpose: string
  status: ProjectStatus
  createdAt: string
  documents: Document[]
  analysis: {
    status: AnalysisStatus
    resultData: any
    errorMessage: string | null
    updatedAt: string
  } | null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getStatusIcon(status: ProjectStatus | AnalysisStatus) {
  switch (status) {
    case 'DRAFT':
    case 'PENDING':
      return <AlertCircle className="h-4 w-4 text-slate-500" />
    case 'UPLOADING':
    case 'PROCESSING':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'FAILED':
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return <AlertCircle className="h-4 w-4" />
  }
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [draftFile, setDraftFile] = useState<File | null>(null)
  const [referenceFiles, setReferenceFiles] = useState<FileList | null>(null)
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) {
        if (res.status === 404) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to fetch project')
      }
      const data = await res.json()
      setProject(data.project)
    } catch {
      toast.error('Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }, [projectId, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  useEffect(() => {
    if (project?.status === 'PROCESSING' || project?.analysis?.status === 'PROCESSING') {
      const interval = setInterval(() => {
        fetchProject()
      }, 5000)
      setPollInterval(interval)
      return () => {
        if (interval) clearInterval(interval)
      }
    }
  }, [project?.status, project?.analysis?.status, fetchProject])

  const handleUpload = async () => {
    if (!draftFile && (!referenceFiles || referenceFiles.length === 0)) {
      toast.error('Please select files to upload')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    
    if (draftFile) {
      formData.append('draft', draftFile)
    }
    
    if (referenceFiles) {
      for (let i = 0; i < referenceFiles.length; i++) {
        formData.append('references', referenceFiles[i])
      }
    }

    try {
      const res = await fetch(`/api/projects/${projectId}/upload`, {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Upload failed')
        return
      }

      toast.success('Files uploaded successfully')
      setDraftFile(null)
      setReferenceFiles(null)
      fetchProject()
    } catch {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)

    try {
      const res = await fetch(`/api/analysis/${projectId}/start`, {
        method: 'POST'
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to start analysis')
        return
      }

      toast.success('Analysis started')
      fetchProject()
    } catch {
      toast.error('Failed to start analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p>Project not found</p>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const draftDoc = project.documents.find(d => d.fileType === 'DRAFT')
  const referenceDocs = project.documents.filter(d => d.fileType === 'REFERENCE')
  const canAnalyze = draftDoc && referenceDocs.length > 0 && project.status === 'DRAFT'
  const isProcessing = project.status === 'PROCESSING' || project.analysis?.status === 'PROCESSING'
  const isCompleted = project.status === 'COMPLETED' || project.analysis?.status === 'COMPLETED'

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription className="mt-2">{project.purpose}</CardDescription>
                </div>
                <Badge variant={project.status === 'COMPLETED' ? 'outline' : project.status === 'FAILED' ? 'destructive' : 'default'}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1">{project.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500">
                Dibuat: {new Date(project.createdAt).toLocaleDateString('id-ID', { 
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unggah Dokumen</CardTitle>
              <CardDescription>
                Unggah draft paper dan dokumen referensi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Draft Paper</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setDraftFile(e.target.files?.[0] || null)
                    }
                    className="max-w-md"
                  />
                  {draftFile && (
                    <span className="text-sm text-slate-600">
                      {draftFile.name} ({formatFileSize(draftFile.size)})
                    </span>
                  )}
                </div>
                {draftDoc && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>{draftDoc.filename}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Dokumen Referensi (bisa pilih beberapa)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    multiple
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                      setReferenceFiles(e.target.files)
                    }
                    className="max-w-md"
                  />
                  {referenceFiles && referenceFiles.length > 0 && (
                    <span className="text-sm text-slate-600">
                      {referenceFiles.length} file dipilih
                    </span>
                  )}
                </div>
                {referenceDocs.length > 0 && (
                  <div className="space-y-1">
                    {referenceDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>{doc.filename}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                onClick={handleUpload} 
                disabled={isUploading || (!draftFile && (!referenceFiles || referenceFiles.length === 0))}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Unggah File
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {project.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File yang Diupload</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama File</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Ukuran</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            {doc.filename}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {doc.fileType === 'DRAFT' ? 'Draft' : 'Referensi'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                        <TableCell>
                          {doc.googleDriveFileId ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Terupload
                            </span>
                          ) : (
                            <span className="text-slate-500">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analisis Sitasi</CardTitle>
              <CardDescription>
                Periksa apakah argumen paper selaras dengan referensi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!draftDoc && (
                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded">
                  Harap upload draft paper terlebih dahulu
                </div>
              )}
              {draftDoc && referenceDocs.length === 0 && (
                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded">
                  Harap upload minimal 1 dokumen referensi
                </div>
              )}
              
              {canAnalyze && (
                <Button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isProcessing}
                  className="w-full"
                >
                  {isAnalyzing || isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Mulai Analisis
                    </>
                  )}
                </Button>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sedang menganalisis...
                  </div>
                  <Progress value={45} className="h-2" />
                  <p className="text-xs text-slate-500">
                    Proses dilakukan secara asinkron. Anda dapat menutup halaman ini dan kembali nanti.
                  </p>
                </div>
              )}

              {isCompleted && project.analysis && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Analisis selesai
                  </div>
                  <Link href={`/projects/${projectId}/results`}>
                    <Button variant="outline" className="w-full">
                      Lihat Hasil
                    </Button>
                  </Link>
                </div>
              )}

              {project.analysis?.status === 'FAILED' && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  Analisis gagal. Silakan coba lagi.
                </div>
              )}
            </CardContent>
          </Card>

          {project.analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Analisis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getStatusIcon(project.analysis.status)}
                  <span className="capitalize">{project.analysis.status.toLowerCase()}</span>
                </div>
                {project.analysis.updatedAt && (
                  <p className="text-sm text-slate-500 mt-2">
                    Terakhir update: {new Date(project.analysis.updatedAt).toLocaleString('id-ID')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}