# Troubleshooting Guide

Solusi untuk masalah umum saat setup dan menggunakan SkripsiMate.

---

## ❌ Error: "The incoming JSON object does not contain a client_email field"

### Cause
Format `GOOGLE_SERVICE_ACCOUNT_KEY` tidak valid atau JSON tidak ter-parse dengan benar.

### Solution

**1. Pastikan format JSON valid**

Contoh yang **BENAR**:
```env
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"my-project","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n","client_email":"my-service@my-project.iam.gserviceaccount.com"}'
```

Contoh yang **SALAH**:
```env
GOOGLE_SERVICE_ACCOUNT_KEY="test-key"  # ❌ Bukan JSON
GOOGLE_SERVICE_ACCOUNT_KEY='...'       # ❌ Tanpa single quotes
```

**2. Wrap dengan single quotes**

Pastikan seluruh JSON di-wrap dengan **single quotes** (`'`), bukan double quotes (`"`):

✅ Benar:
```env
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

❌ Salah:
```env
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

**3. Validasi JSON**

Gunakan [JSON Lint](https://jsonlint.com/) untuk memastikan JSON valid.

Copy isi `GOOGLE_SERVICE_ACCOUNT_KEY` dan paste ke JSON Lint.

**4. Pastikan field `client_email` ada**

JSON harus mengandung field `client_email`:
```json
{
  "client_email": "my-service@my-project.iam.gserviceaccount.com",
  ...
}
```

**5. Jangan escape double quotes berlebihan**

Di file JSON, double quotes di dalam object string tetap double quotes:

✅ Benar:
```env
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","client_email":"..."}'
```

❌ Salah (terlalu banyak escape):
```env
GOOGLE_SERVICE_ACCOUNT_KEY='{\"type\":\"service_account\",\"client_email\":\"...\"}'
```

### Troubleshooting Steps

1. Cek error log di console server:
   ```bash
   npm run dev
   ```

2. Error message akan menunjukkan:
   - Length dari credentials
   - First 50 karakter
   - Keys yang tersedia di parsed credentials

3. Jika `client_email` tidak ada di list keys, berarti JSON salah format.

### Testing

Buat test script untuk verifikasi:

```javascript
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
console.log('Client email:', credentials.client_email);
console.log('Available keys:', Object.keys(credentials));
```

---

## ❌ Error: "GOOGLE_SERVICE_ACCOUNT_KEY is not configured"

### Cause
Environment variable `GOOGLE_SERVICE_ACCOUNT_KEY` tidak di-set.

### Solution

1. Buka file `.env`
2. Tambah atau update:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY='paste-json-here'
   ```
3. Restart server:
   ```bash
   npm run dev
   ```

---

## ❌ Error: "Invalid GOOGLE_SERVICE_ACCOUNT_KEY format"

### Cause
JSON tidak valid atau tidak bisa di-parse.

### Solution

1. Validasi JSON di [JSON Lint](https://jsonlint.com/)
2. Pastikan tidak ada typo
3. Pastikan seluruh JSON di-wrap dengan single quotes
4. Restart server

---

## ❌ Error: "Forbidden 403" saat create folder/upload

### Cause
Service account tidak memiliki akses ke Google Drive folder.

### Solution

**1. Share folder dengan service account**

1. Buka Google Drive
2. Klik folder → Share
3. Copy email service account: `my-service@my-project.iam.gserviceaccount.com`
4. Paste di "Add people and groups"
5. Set role: **Editor**
6. Klik Send

**2. Pastikan folder ID benar**

Copy folder ID dari URL:
- URL: `https://drive.google.com/drive/folders/1ABCxyz...`
- Folder ID: `1ABCxyz...`

**3. Cek apakah service account sudah di-invite**

- Buka Google Drive → Shared with me
- Pastikan email service account muncul

---

## ❌ Error: "Insufficient Permission"

### Cause
Google Drive API belum di-enable atau scope salah.

### Solution

**1. Enable Google Drive API**

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/library)
2. Cari **Google Drive API**
3. Klik **Enable**

**2. Cek scope di kode**

Scope yang digunakan:
```typescript
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
]
```

**3. Re-generate private key**

1. Buka [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Klik service account → Keys tab
3. Delete old key
4. Create new key (JSON)
5. Update environment variable

---

## ❌ Error: "File upload failed" / "Failed to create folder"

### Cause
Network issue, quota exceeded, atau invalid folder ID.

### Solution

**1. Cek log error**

Log akan menampilkan pesan error spesifik.

**2. Verifikasi folder ID**

Gunakan [Google Drive Picker](https://developers.google.com/drive/picker) untuk verify folder ID.

**3. Cek quota**

Google Drive API memiliki quota limits. Lihat:
- [Google Cloud Quotas](https://console.cloud.google.com/apis/api/drive.googleapis.com/quotas)

---

## ❌ Error: "Project not found" / "Unauthorized"

### Cause
User tidak login atau project ID salah.

### Solution

**1. Verify user login**

```javascript
// Check /api/auth/me
fetch('/api/auth/me')
  .then(res => res.json())
  .then(data => console.log(data.user))
```

**2. Check project ownership**

Project hanya bisa diakses oleh pembuatnya.

**3. Clear cookies**

```javascript
// Clear JWT cookie
fetch('/api/auth/logout', { method: 'POST' })
```

---

## ❌ Error: "Failed to load projects" / "Failed to fetch project"

### Cause
Database connection issue atau auth token expired.

### Solution

**1. Verify database connection**

```bash
npx prisma db pull
```

**2. Check DATABASE_URL**

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**3. Check JWT_SECRET**

Must be at least 32 characters.

---

## ❌ Error: "n8n webhook request failed"

### Cause
n8n URL salah, n8n tidak accessible, atau API key salah.

### Solution

**1. Verify n8n URL**

Buka n8n webhook URL di browser - harus mengembalikan response.

**2. Check n8n logs**

Cek logs n8n untuk error.

**3. Verify API key**

Match `N8N_API_KEY` di environment dengan n8n settings.

---

## ❌ Error: "Failed to send reset email"

### Cause
Resend API key salah atau email address invalid.

### Solution

**1. Verify Resend API key**

Login ke [Resend Dashboard](https://resend.com) → API Keys.

**2. Verify email format**

```env
RESEND_FROM_EMAIL=SkripsiMate <noreply@skripsimate.com>
# atau
RESEND_FROM_EMAIL=noreply@skripsimate.com
```

**3. Check email logs**

Buka Resend Dashboard → Logs untuk error details.

---

## 🔧 Debugging Tips

### Enable verbose logging

```javascript
// src/lib/google-drive.ts
console.log('Credentials length:', credentials.length)
console.log('Credentials preview:', credentials.substring(0, 100))
```

### Check environment variables

```bash
# Print all env vars (be careful with secrets!)
printenv | grep GOOGLE
```

### Test with smaller files

Upload file kecil dulu untuk verify connection:
- 1KB text file
- Check di Google Drive

### Use Postman/curl untuk test API

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","purpose":"Test"}'
```

---

## 📞 Need Help?

Jika masalah persist:

1. Check logs secara detail
2. Verify semua environment variables
3. Cek dokumentasi:
   - [SETUP_GOOGLE_DRIVE.md](./SETUP_GOOGLE_DRIVE.md)
   - [CLAUDE.md](./CLAUDE.md)
4. Open GitHub issue dengan:
   - Error message lengkap
   - Stack trace
   - Environment (local/production)
   - Steps to reproduce