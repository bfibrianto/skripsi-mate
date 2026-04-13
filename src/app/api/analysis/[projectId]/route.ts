import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
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
          where: { fileType: 'DRAFT' },
          select: { id: true, filename: true, googleDriveFileId: true }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const analysis = await prisma.analysisResult.findUnique({
      where: { projectId }
    })

    if (!analysis) {
      return NextResponse.json({
        status: 'PENDING',
        message: 'No analysis started yet'
      })
    }

    return NextResponse.json({
      status: analysis.status,
      resultData: analysis.resultData,
      errorMessage: analysis.errorMessage,
      updatedAt: analysis.updatedAt
    })
  } catch (error) {
    console.error('Get analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}