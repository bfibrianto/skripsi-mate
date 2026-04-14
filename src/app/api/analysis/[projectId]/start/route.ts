import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await params

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      },
      include: {
        documents: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const draftDoc = project.documents.find((d) => d.fileType === 'DRAFT')
    const referenceDocs = project.documents.filter((d) => d.fileType === 'REFERENCE')

    if (!draftDoc) {
      return NextResponse.json(
        { error: 'No draft file uploaded' },
        { status: 400 }
      )
    }

    if (!draftDoc.fileData) {
      return NextResponse.json(
        { error: 'Draft file data not found' },
        { status: 400 }
      )
    }

    if (referenceDocs.length === 0) {
      return NextResponse.json(
        { error: 'No reference documents uploaded' },
        { status: 400 }
      )
    }

    if (!project.folderId) {
      return NextResponse.json(
        { error: 'Project folder not initialized' },
        { status: 400 }
      )
    }

    const n8nReferenceUrl = process.env.N8N_REFERENCE_WEBHOOK_URL
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nReferenceUrl) {
      console.error('N8N_REFERENCE_WEBHOOK_URL not configured')
      return NextResponse.json(
        { error: 'Analysis service not configured' },
        { status: 500 }
      )
    }

    // Set status ke PROCESSING_REFERENCES
    if (!await prisma.analysisResult.findUnique({ where: { projectId } })) {
      await prisma.analysisResult.create({
        data: { projectId, status: 'PROCESSING_REFERENCES' }
      })
    } else {
      await prisma.analysisResult.update({
        where: { projectId },
        data: {
          status: 'PROCESSING_REFERENCES',
          resultData: undefined,
          errorMessage: null
        }
      })
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'PROCESSING_REFERENCES' }
    })

    // Kirim ke n8n: hanya folder_id (referensi ada di Google Drive dalam folder tersebut)
    // File DRAFT dikirim sebagai multipart
    const formData = new FormData()
    formData.append('project_id', projectId)
    formData.append('folder_id', project.folderId)

    const draftBlob = new Blob([draftDoc.fileData], {
      type: 'application/octet-stream'
    })
    formData.append('draft_file', draftBlob, draftDoc.filename)

    try {
      const headers: Record<string, string> = {}
      if (n8nApiKey) {
        headers['api_key'] = n8nApiKey
      }

      const n8nResponse = await fetch(n8nReferenceUrl, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!n8nResponse.ok) {
        const text = await n8nResponse.text()
        console.error('n8n reference webhook returned error:', n8nResponse.status, text)
      }
    } catch (n8nError) {
      console.error('Error calling n8n reference webhook:', n8nError)
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis started',
      projectStatus: 'PROCESSING_REFERENCES'
    })

  } catch (error) {
    console.error('Start analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
