import { google } from 'googleapis'
import { Readable } from 'stream'

function getGoogleDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN must all be configured')
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken })

  return google.drive({ version: 'v3', auth: oauth2Client })
}

export async function createFolder(projectTitle: string, userName: string): Promise<string> {
  const drive = getGoogleDriveClient()
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const folderName = `${projectTitle}_${userName}_${timestamp}`
  
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID

  const folderMeta = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentFolderId && { parents: [parentFolderId] })
  }

  const folder = await drive.files.create({
    requestBody: folderMeta,
    fields: 'id'
  })

  if (!folder.data.id) {
    throw new Error('Failed to create folder')
  }

  return folder.data.id
}

export async function uploadFile(
  folderId: string,
  file: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const drive = getGoogleDriveClient()

  const stream = Readable.from(file)

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId]
    },
    media: {
      mimeType,
      body: stream
    },
    fields: 'id'
  })

  if (!response.data.id) {
    throw new Error(`Failed to upload file: ${filename}`)
  }

  return response.data.id
}

export async function deleteFolder(folderId: string): Promise<void> {
  const drive = getGoogleDriveClient()

  await drive.files.delete({
    fileId: folderId
  })
}

export async function deleteFile(fileId: string): Promise<void> {
  const drive = getGoogleDriveClient()

  await drive.files.delete({
    fileId
  })
}

export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }

  return mimeTypes[ext || ''] || 'application/octet-stream'
}