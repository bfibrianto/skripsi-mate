import { google } from 'googleapis'

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
]

function getGoogleDriveClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  
  if (!credentials) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not configured')
  }

  let parsedCredentials: any
  
  try {
    parsedCredentials = JSON.parse(credentials)
  } catch (error) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', error)
    console.error('Raw credentials length:', credentials.length)
    console.error('Credentials starts with:', credentials.substring(0, 50))
    throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY format. Must be valid JSON wrapped in single quotes.')
  }

  if (!parsedCredentials.client_email) {
    console.error('Parsed credentials missing client_email. Available keys:', Object.keys(parsedCredentials))
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY missing client_email field. Ensure the JSON key is correctly formatted.')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: parsedCredentials,
    scopes: SCOPES
  })

  return google.drive({ version: 'v3', auth })
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

  const response = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId]
    },
    media: {
      mimeType,
      body: file
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