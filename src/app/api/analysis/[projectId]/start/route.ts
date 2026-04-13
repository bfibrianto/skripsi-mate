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
        documents: {
          where: { fileType: 'DRAFT' }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.documents.length === 0) {
      return NextResponse.json(
        { error: 'No draft file uploaded' },
        { status: 400 }
      )
    }

    const referenceDocs = await prisma.document.findMany({
      where: {
        projectId,
        fileType: 'REFERENCE'
      },
      select: { id: true, googleDriveFileId: true, filename: true }
    })

    if (referenceDocs.length === 0) {
      return NextResponse.json(
        { error: 'No reference documents uploaded' },
        { status: 400 }
      )
    }

    const draftDoc = project.documents[0]

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL
    const n8nApiKey = process.env.N8N_API_KEY

    if (!n8nWebhookUrl) {
      console.error('N8N_WEBHOOK_URL not configured')
      return NextResponse.json(
        { error: 'Analysis service not configured' },
        { status: 500 }
      )
    }

    let analysisResult = await prisma.analysisResult.findUnique({
      where: { projectId }
    })

    if (!analysisResult) {
      analysisResult = await prisma.analysisResult.create({
        data: {
          projectId,
          status: 'PROCESSING'
        }
      })
    } else {
      await prisma.analysisResult.update({
        where: { projectId },
        data: {
          status: 'PROCESSING',
          resultData: undefined,
          errorMessage: null
        }
      })
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'PROCESSING' }
    })

    const n8nPayload = {
      project_id: projectId,
      draft_file_id: draftDoc.googleDriveFileId,
      draft_filename: draftDoc.filename,
      reference_files: referenceDocs.map((doc: { googleDriveFileId: string | null; filename: string }) => ({
        file_id: doc.googleDriveFileId,
        filename: doc.filename
      })),
      project_title: project.title,
      project_purpose: project.purpose,
      timestamp: new Date().toISOString()
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      if (n8nApiKey) {
        headers['Authorization'] = `Bearer ${n8nApiKey}`
      }

      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(n8nPayload)
      }).catch((err) => {
        console.error('n8n webhook request failed:', err)
        return null
      })

      if (n8nResponse && !n8nResponse.ok) {
        console.error('n8n webhook returned error:', n8nResponse.status, await n8nResponse.text())
      }

    } catch (n8nError) {
      console.error('Error calling n8n webhook:', n8nError)
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis started',
      projectStatus: 'PROCESSING'
    })

  } catch (error) {
    console.error('Start analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}