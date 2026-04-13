# SkripsiMate - Project Documentation

## Project Overview

**SkripsiMate** adalah web application yang membantu mahasiswa mengerjakan skripsi dengan bantuan AI. Pada versi 1.0, aplikasi menyediakan satu tool utama: **Citation Check** - tool untuk menganalisa apakah argumen dalam paper mahasiswa selaras dengan sumber referensi yang digunakan.

### Masalah yang Diselesaikan

Mahasiswa sering kali kesulitan memverifikasi apakah argumen dalam skripsi mereka didukung dengan benar oleh sumber referensi. Proses ini manual dan memakan waktu. SkripsiMate mengotomatisasi proses ini dengan AI.

### Target Pengguna

Mahasiswa yang sedang mengerjakan skripsi/tesis yang perlu memvalidasi sitasi dan argumen dalam paper mereka.

---

## Specification

### Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                             │
│  ├── Landing Page                                               │
│  ├── Auth Pages (Login, Register, Forgot Password)             │
│  ├── Dashboard (List Project)                                  │
│  └── Project Detail (Upload Files, Start Analysis, View Results)│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP
┌─────────────────────────────────────────────────────────────────┐
│                  VERCEL (Serverless API Routes)                 │
│  ├── /api/auth/*        → Authentication (JWT + bcrypt)       │
│  ├── /api/projects/*    → Project CRUD + GDrive folder creation│
│  ├── /api/projects/[id]/upload → File upload to Google Drive   │
│  └── /api/analysis/*    → Trigger n8n webhook + poll status   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────────┐
│   Supabase    │   │  Google Drive   │   │      n8n Cloud     │
│  PostgreSQL   │   │ Service Account │   │   (Async Processing)│
│  (Native Auth)│   │  (File Storage)  │   │  (Vector DB + AI)   │
└───────────────┘   └─────────────────┘   └─────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript |
| **Styling** | Tailwind CSS + Shadcn/UI |
| **Database** | Supabase PostgreSQL (Native Auth, bukan Supabase Auth) |
| **ORM** | Prisma v6 |
| **Auth** | JWT in httpOnly cookies + bcrypt |
| **File Storage** | Google Drive API (Service Account) |
| **External AI** | n8n Webhook (Async processing) |
| **Email** | Resend (Password reset) |
| **Deployment** | Vercel |

### Database Schema

```prisma
// users - Native auth (bukan Supabase Auth)
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  resetToken   String?
  resetTokenExp DateTime?
  createdAt    DateTime  @default(now())
  projects     Project[]
}

// projects - Setiap project punya folder GDrive sendiri
model Project {
  id          String       @id @default(uuid())
  userId      String
  title       String
  purpose     String
  status      ProjectStatus @default(DRAFT)
  folderId    String?      // Google Drive folder ID
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  user        User         @relation(...)
  documents   Document[]
  analysis    AnalysisResult?
}

enum ProjectStatus {
  DRAFT
  UPLOADING
  PROCESSING
  COMPLETED
  FAILED
}

// documents - File yang diupload (draft + references)
model Document {
  id                String    @id @default(uuid())
  projectId         String
  filename          String
  googleDriveFileId String?
  fileType          FileType  // DRAFT atau REFERENCE
  fileSize          Int
  uploadedAt        DateTime?
  createdAt         DateTime  @default(now())
}

enum FileType {
  DRAFT
  REFERENCE
}

// analysis_results - Hasil dari n8n (bukan dari n8n API)
model AnalysisResult {
  id           String          @id @default(uuid())
  projectId    String          @unique
  status       AnalysisStatus  @default(PENDING)
  resultData   Json?           // Hasil analisis dari n8n
  errorMessage String?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

enum AnalysisStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login, returns JWT cookie |
| POST | `/api/auth/logout` | Clear JWT cookie |
| POST | `/api/auth/forgot-password` | Kirim reset email |
| POST | `/api/auth/reset-password` | Reset password dengan token |
| GET | `/api/auth/me` | Get current user |

#### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List semua project user |
| POST | `/api/projects` | Create project + GDrive folder |
| GET | `/api/projects/[id]` | Get project detail |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project + GDrive folder |
| POST | `/api/projects/[id]/upload` | Upload files ke GDrive |

#### Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analysis/[id]` | Get status & results |
| POST | `/api/analysis/[id]/start` | Trigger n8n webhook |

### User Flow

```
1. USER REGISTRATION/LOGIN
   └─► Create account / Login dengan email & password

2. CREATE PROJECT
   └─► User enters: Title, Purpose of paper
   └─► System creates: Project record + Google Drive folder
       Folder: "{ProjectTitle}_{UserName}_{Timestamp}"

3. UPLOAD DOCUMENTS
   └─► User uploads: Draft paper (PDF/DOCX)
   └─► User uploads: Reference documents (multiple)
   └─► System uploads ALL files to Google Drive in PARALLEL
   └─► System creates document records in database

4. TRIGGER ANALYSIS
   └─► User clicks "Analyze Citation"
   └─► System sends HTTP POST to n8n webhook
   └─► Project status → "PROCESSING"
   └─► Returns immediately (async)

5. STATUS POLLING
   └─► Frontend polls /api/analysis/[projectId] every 5 seconds
   └─► Display current status

6. VIEW RESULTS
   └─► n8n inserts results to analysis_results table
   └─► n8n updates project status to COMPLETED
   └─► User sees results on results page
```

### Security Considerations

1. **Server-Side Only**: Semua credential (GDrive, n8n, Resend) disimpan di server-side environment variables
2. **JWT**: Token disimpan di httpOnly cookie, tidak accessible oleh JavaScript
3. **Password**: Di-hash dengan bcrypt (salt rounds: 12)
4. **User Isolation**: Users hanya bisa akses project mereka sendiri
5. **File Validation**: Max 10MB per file, max 20 files per project

---

## Implementation Plan

### Fase 1: Setup & Foundation
- [x] Initialize Next.js project dengan TypeScript + Tailwind
- [x] Setup Shadcn/UI components
- [x] Setup Prisma dengan PostgreSQL schema
- [x] Configure environment variables

### Fase 2: Authentication
- [x] Implement register API + page
- [x] Implement login API + page
- [x] Implement logout
- [x] Implement forgot/reset password dengan Resend

### Fase 3: Project Management
- [x] Create project API (dengan GDrive folder creation)
- [x] Project CRUD API
- [x] File upload API (parallel upload ke GDrive)
- [x] Dashboard page (list projects)
- [x] Project detail page

### Fase 4: Analysis Integration
- [x] Trigger n8n webhook API
- [x] Get analysis status/results API
- [x] Frontend polling (every 5s)
- [x] Results display page

### Fase 5: Polish
- [x] Responsive design
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Build verification

---

## Environment Variables

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# JWT Authentication
JWT_SECRET=your-super-secret-key-min-32-characters-long

# Google Drive (Service Account)
# 📖 Lihat panduan lengkap: SETUP_GOOGLE_DRIVE.md
# 1. Buat Google Cloud Project & Enable Drive API
# 2. Buat Service Account & download JSON key
# 3. Share Google Drive folder dengan service account email
# 4. Copy PASTE isi file JSON ke variable ini (wrap dengan single quotes!)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@...iam.gserviceaccount.com"}'
GOOGLE_DRIVE_FOLDER_ID=1ABC...xyz

# n8n Integration
N8N_WEBHOOK_URL=https://your-n8n.cloud/webhook/analysis
N8N_API_KEY=your-n8n-api-key

# Email (Resend)
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=SkripsiMate <noreply@skripsimate.com>
APP_URL=https://your-app.vercel.app
```

---

## n8n Integration (Out of Scope)

n8n service tidak diimplementasikan dalam project ini. Yang perlu dilakukan oleh n8n:

1. **Terima webhook** dari `/api/analysis/[id]/start`
2. **Proses referensi** → buat vector embeddings
3. **Analisa draft** → bandingkan dengan referensi
4. **Simpan hasil** ke tabel `analysis_results`
5. **Update status** project menjadi COMPLETED

Format payload ke n8n:
```json
{
  "project_id": "uuid",
  "draft_file_id": "google_drive_file_id",
  "reference_files": [{"file_id": "...", "filename": "..."}],
  "project_title": "...",
  "project_purpose": "..."
}
```

Format hasil yang disimpan ke database:
```json
{
  "summary": "...",
  "citations": [{"text": "...", "source": "...", "matched": true, "confidence": 0.95}],
  "mismatches": [{"text": "...", "issue": "...", "suggestion": "..."}],
  "overall_score": 85
}
```

---

## Build & Deployment

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push

# Development
npm run dev

# Production build
npm run build

# Deploy ke Vercel
vercel deploy
```