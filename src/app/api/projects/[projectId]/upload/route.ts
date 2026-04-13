import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { uploadFile, getMimeType } from '@/lib/google-drive'

function parseFormData(form: any): Promise<{ fields: any; files: any }> {
  return new Promise((resolve, reject) => {
    const fields: any = {}
    const files: any = {}

    form.on('field', (field: string, value: any) => {
      fields[field] = value
    })

    form.on('file', (field: string, file: any) => {
      if (!files[field]) {
        files[field] = []
      }
      files[field].push(file)
    })

    form.on('end', () => {
      resolve({ fields, files })
    })

    form.on('error', reject)
  })
}

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
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (!project.folderId) {
      return NextResponse.json(
        { error: 'Project folder not initialized' },
        { status: 400 }
      )
    }

    const contentType = request.headers.get('content-type') || ''
    
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    
    const draftFile = formData.get('draft') as File | null
    const referenceFiles = formData.getAll('references') as File[]
    
    const allFiles: { file: File; type: 'DRAFT' | 'REFERENCE' }[] = []
    
    if (draftFile) {
      allFiles.push({ file: draftFile, type: 'DRAFT' })
    }
    
    for (const refFile of referenceFiles) {
      allFiles.push({ file: refFile, type: 'REFERENCE' })
    }

    if (allFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024
    const MAX_FILES = 20

    if (allFiles.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      )
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'UPLOADING' }
    })

    const uploadPromises = allFiles.map(async ({ file, type }) => {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const mimeType = getMimeType(file.name)
      
      const googleDriveFileId = await uploadFile(
        project.folderId!,
        buffer,
        file.name,
        mimeType
      )

      const document = await prisma.document.create({
        data: {
          projectId,
          filename: file.name,
          googleDriveFileId,
          fileType: type,
          fileSize: buffer.length,
          uploadedAt: new Date()
        }
      })

      return document
    })

    const documents = await Promise.all(uploadPromises)

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'DRAFT' }
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Upload error:', error)
    
    try {
      const { projectId } = await params
      await prisma.project.update({
        where: { id: projectId },
        data: { status: 'FAILED' }
      })
    } catch {}

    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}