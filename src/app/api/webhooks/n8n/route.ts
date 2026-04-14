import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * Callback endpoint dipanggil oleh n8n setelah analisa referensi selesai.
 * n8n mengirim POST dengan header api_key dan body berisi project_id.
 * Website kemudian trigger n8n endpoint kedua untuk analisa citation.
 */
export async function POST(request: NextRequest) {
  try {
    // Validasi api_key
    const apiKey = request.headers.get('api_key')
    const expectedApiKey = process.env.N8N_API_KEY

    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { project_id } = body

    if (!project_id) {
      return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
    }

    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: {
        documents: {
          where: { fileType: 'DRAFT' },
          select: { id: true, filename: true, fileData: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Update status ke PROCESSING_CITATIONS
    await prisma.analysisResult.update({
      where: { projectId: project_id },
      data: { status: 'PROCESSING_CITATIONS' }
    })

    await prisma.project.update({
      where: { id: project_id },
      data: { status: 'PROCESSING_CITATIONS' }
    })

    // Trigger n8n endpoint kedua untuk analisa citation
    const n8nCitationUrl = process.env.N8N_CITATION_WEBHOOK_URL
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nCitationUrl) {
      console.error('N8N_CITATION_WEBHOOK_URL not configured')
      return NextResponse.json({ error: 'Citation analysis service not configured' }, { status: 500 })
    }

    const draftDoc = project.documents[0]

    const formData = new FormData()
    formData.append('project_id', project_id)
    formData.append('folder_id', project.folderId ?? '')

    if (draftDoc?.fileData) {
      const draftBlob = new Blob([draftDoc.fileData], {
        type: 'application/octet-stream'
      })
      formData.append('draft_file', draftBlob, draftDoc.filename)
    }

    try {
      const headers: Record<string, string> = {}
      if (n8nApiKey) {
        headers['api_key'] = n8nApiKey
      }

      const n8nResponse = await fetch(n8nCitationUrl, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!n8nResponse.ok) {
        const text = await n8nResponse.text()
        console.error('n8n citation webhook returned error:', n8nResponse.status, text)
      }
    } catch (n8nError) {
      console.error('Error calling n8n citation webhook:', n8nError)
    }

    return NextResponse.json({
      success: true,
      message: 'Reference analysis complete, citation analysis started'
    })
  } catch (error) {
    console.error('n8n reference callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
