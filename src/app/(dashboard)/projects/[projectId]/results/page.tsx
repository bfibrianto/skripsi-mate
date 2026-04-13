'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Loader2, CheckCircle, XCircle, AlertTriangle, FileText, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

interface Project {
  id: string
  title: string
  purpose: string
}

interface AnalysisResult {
  status: AnalysisStatus
  resultData: {
    summary?: string
    citations?: Array<{
      text: string
      source: string
      matched: boolean
      confidence: number
    }>
    mismatches?: Array<{
      text: string
      issue: string
      suggestion: string
    }>
    overall_score?: number
  } | null
  errorMessage: string | null
  updatedAt: string
}

function getStatusIcon(status: AnalysisStatus) {
  switch (status) {
    case 'PENDING':
      return <AlertTriangle className="h-5 w-5 text-slate-500" />
    case 'PROCESSING':
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    case 'COMPLETED':
      return <CheckCircle className="h-5 w-5 text-green-600" />
    case 'FAILED':
      return <XCircle className="h-5 w-5 text-red-600" />
  }
}

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [projectRes, analysisRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/analysis/${projectId}`)
      ])

      if (!projectRes.ok || !analysisRes.ok) {
        throw new Error('Failed to fetch data')
      }

      const projectData = await projectRes.json()
      const analysisData = await analysisRes.json()

      setProject(projectData.project)
      
      if (analysisData.status) {
        setAnalysis({
          status: analysisData.status,
          resultData: analysisData.resultData,
          errorMessage: analysisData.errorMessage,
          updatedAt: analysisData.updatedAt
        })
      }
    } catch {
      toast.error('Failed to load results')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (analysis?.status === 'PROCESSING') {
      const interval = setInterval(fetchData, 5000)
      return () => clearInterval(interval)
    }
  }, [analysis?.status, fetchData])

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

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Project
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
        <p className="text-slate-600 mt-2">{project.purpose}</p>
      </div>

      {analysis?.status === 'PENDING' && (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Belum Ada Analisis</h3>
            <p className="text-slate-600">
              Silakan mulai analisis dari halaman project terlebih dahulu.
            </p>
            <Button onClick={() => router.push(`/projects/${projectId}`)} className="mt-4">
              Ke Halaman Project
            </Button>
          </CardContent>
        </Card>
      )}

      {analysis?.status === 'PROCESSING' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Sedang Memproses Analisis</h3>
            <p className="text-slate-600">
              Harap tunggu... Analisis dilakukan secara asinkron.
            </p>
          </CardContent>
        </Card>
      )}

      {analysis?.status === 'FAILED' && (
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Analisis Gagal</h3>
            <p className="text-slate-600 mb-4">{analysis.errorMessage || 'Terjadi kesalahan saat menganalisis'}</p>
            <Button onClick={() => router.push(`/projects/${projectId}`)}>
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {analysis?.status === 'COMPLETED' && analysis.resultData && (
        <div className="space-y-6">
          {analysis.resultData.overall_score !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Skor Keselarasan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${
                    analysis.resultData.overall_score >= 80 ? 'text-green-600' :
                    analysis.resultData.overall_score >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {analysis.resultData.overall_score}%
                  </div>
                  <div className="text-slate-600">
                    {analysis.resultData.overall_score >= 80 ? 'Sangat Baik' :
                     analysis.resultData.overall_score >= 60 ? 'Cukup Baik' :
                     'Perlu Perbaikan'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.resultData.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Analisis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{analysis.resultData.summary}</p>
              </CardContent>
            </Card>
          )}

          {analysis.resultData.citations && analysis.resultData.citations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Daftar Sitasi</CardTitle>
                <CardDescription>
                  Hasil pencocokan argumen dengan sumber referensi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.resultData.citations.map((citation, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg border ${
                        citation.matched ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {citation.matched ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-slate-800">{citation.text}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-slate-600">Sumber: {citation.source}</span>
                            <span className="text-slate-500">
                              Confidence: {Math.round(citation.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.resultData.mismatches && analysis.resultData.mismatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Ditemukan Ketidaksesuaian</CardTitle>
                <CardDescription>
                  Argumen yang perlu diperbaiki atau diverifikasi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.resultData.mismatches.map((mismatch, index) => (
                    <div key={index} className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{mismatch.text}</p>
                          <p className="text-red-600 mt-1">Issue: {mismatch.issue}</p>
                          <p className="text-green-700 mt-1">Saran: {mismatch.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}