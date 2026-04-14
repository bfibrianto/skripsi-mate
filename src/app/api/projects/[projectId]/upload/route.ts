import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { uploadFile, getMimeType } from '@/lib/google-drive'

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

    if (!draftFile && referenceFiles.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const MAX_FILES = 20

    if (referenceFiles.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} reference files allowed` },
        { status: 400 }
      )
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'UPLOADING' }
    })

    const documents = []

    // File DRAFT: simpan ke DB (tidak diupload ke Google Drive)
    if (draftFile) {
      const arrayBuffer = await draftFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Hapus dokumen DRAFT lama jika ada
      await prisma.document.deleteMany({
        where: { projectId, fileType: 'DRAFT' }
      })

      const document = await prisma.document.create({
        data: {
          projectId,
          filename: draftFile.name,
          fileType: 'DRAFT',
          fileSize: buffer.length,
          fileData: buffer,
          uploadedAt: new Date()
        }
      })

      documents.push(document)
    }

    // File REFERENCE: upload ke Google Drive
    if (referenceFiles.length > 0) {
      const uploadPromises = referenceFiles.map(async (file) => {
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
            fileType: 'REFERENCE',
            fileSize: buffer.length,
            uploadedAt: new Date()
          }
        })

        return document
      })

      const refDocuments = await Promise.all(uploadPromises)
      documents.push(...refDocuments)
    }

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'DRAFT' }
    })

    // Jangan kembalikan fileData di response
    const sanitized = documents.map(({ ...doc }) => {
      const { fileData, ...rest } = doc as typeof doc & { fileData?: unknown }
      void fileData
      return rest
    })

    return NextResponse.json({ documents: sanitized })
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
