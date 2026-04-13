# SkripsiMate

AI-powered citation analysis tool untuk membantu mahasiswa mengerjakan skripsi.

## 📖 Tentang SkripsiMate

SkripsiMate membantu mahasiswa memverifikasi apakah argumen dalam paper mereka selaras dengan sumber referensi menggunakan AI. Sistem ini mengotomatisasi proses analisis sitasi yang biasanya manual dan memakan waktu.

### Fitur Utama

- ✅ **Authentication**: Register, login, forgot password dengan email (Resend)
- ✅ **Project Management**: Buat dan kelola multiple project
- ✅ **File Upload**: Upload draft paper dan dokumen referensi ke Google Drive
- ✅ **Parallel Upload**: Upload multiple files secara bersamaan
- ✅ **AI Analysis**: Trigger analisis via n8n webhook
- ✅ **Real-time Status**: Polling status setiap 5 detik
- ✅ **Results Viewer**: Tampilkan hasil analisis lengkap

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (disarankan menggunakan Supabase)
- Google Cloud account untuk Google Drive API
- n8n instance untuk AI processing

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd skripsi-mate
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables

Copy `.env.example` ke `.env` dan isi dengan credentials Anda:

```bash
cp .env.example .env
```

Environment variables yang diperlukan:

| Variable | Description | Contoh |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret key untuk JWT | `your-secret-key-min-32-chars` |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Drive service account JSON | `{"type":"service_account",...}` |
| `GOOGLE_DRIVE_FOLDER_ID` | Parent folder ID (opsional) | `1ABC...xyz` |
| `N8N_WEBHOOK_URL` | n8n webhook URL | `https://your-n8n.com/webhook` |
| `N8N_API_KEY` | n8n API key (opsional) | `your-api-key` |
| `RESEND_API_KEY` | Resend API key | `re_xxxxx` |
| `RESEND_FROM_EMAIL` | Email pengirim | `SkripsiMate <noreply@...>` |
| `APP_URL` | Base URL aplikasi | `http://localhost:3000` |

📖 **Lihat panduan lengkap setup Google Drive:** [SETUP_GOOGLE_DRIVE.md](./SETUP_GOOGLE_DRIVE.md)

4. Setup database

```bash
npx prisma db push
```

5. Run development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🏗️ Project Structure

```
skripsi-mate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Halaman auth
│   │   ├── (dashboard)/       # Halaman protected
│   │   └── api/              # API routes
│   ├── components/            # UI components (Shadcn)
│   └── lib/                  # Utilities
├── prisma/                   # Database schema
└── public/                   # Static assets
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React, TypeScript |
| Styling | Tailwind CSS + Shadcn/UI |
| Database | Supabase PostgreSQL |
| ORM | Prisma v6 |
| Auth | JWT (httpOnly cookies) + bcrypt |
| File Storage | Google Drive API (Service Account) |
| External AI | n8n Webhook |
| Email | Resend |
| Deployment | Vercel |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Buat akun baru
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Kirim reset email
- `POST /api/auth/reset-password` - Reset password

### Projects
- `GET /api/projects` - List semua project
- `POST /api/projects` - Buat project baru
- `GET /api/projects/[id]` - Detail project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Hapus project
- `POST /api/projects/[id]/upload` - Upload file

### Analysis
- `GET /api/analysis/[id]` - Get status & results
- `POST /api/analysis/[id]/start` - Mulai analisis

## 🗄️ Database Schema

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  name         String
  projects     Project[]
}

model Project {
  id        String       @id @default(uuid())
  userId    String
  title     String
  purpose   String
  status    ProjectStatus
  folderId  String?
  documents Document[]
  analysis  AnalysisResult?
}

model Document {
  id                String    @id @default(uuid())
  projectId         String
  filename          String
  googleDriveFileId String?
  fileType          FileType
  fileSize          Int
}

model AnalysisResult {
  id           String          @id @default(uuid())
  projectId    String          @unique
  status       AnalysisStatus
  resultData   Json?
  errorMessage String?
}
```

## 🔄 User Flow

1. **Register/Login** - User membuat akun atau login
2. **Create Project** - User membuat project baru (auto create folder di GDrive)
3. **Upload Documents** - Upload draft paper dan referensi (parallel upload)
4. **Start Analysis** - Trigger n8n webhook untuk proses analisis
5. **View Results** - Lihat hasil analisis setelah selesai

## 🚢 Deployment

### Deploy ke Vercel

1. Push code ke GitHub
2. Buka [Vercel Dashboard](https://vercel.com)
3. Import repository
4. Set environment variables di project settings
5. Deploy

**Environment Variables di Vercel:**
- Set semua variables dari `.env` di Environment Variables section
- Pastikan `DATABASE_URL` di-set dengan connection string Supabase production
- Set `GOOGLE_SERVICE_ACCOUNT_KEY` dengan format yang benar (wrap dengan single quotes)
- Set `APP_URL` ke production URL

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Project overview, specification, dan implementation plan
- [SETUP_GOOGLE_DRIVE.md](./SETUP_GOOGLE_DRIVE.md) - Panduan lengkap setup Google Service Account
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solusi untuk masalah umum

## 🤝 Contributing

1. Fork repository
2. Create branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

Distributed under the MIT License.

## 🙏 Acknowledgments

- Next.js team untuk framework yang amazing
- Shadcn untuk UI components yang beautiful
- Vercel untuk deployment platform
- Supabase untuk managed PostgreSQL
- Google Cloud untuk Drive API
- Resend untuk email service