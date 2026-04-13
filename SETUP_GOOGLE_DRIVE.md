# Setup Google Service Account untuk SkripsiMate

Panduan ini menjelaskan cara setup Google Service Account untuk upload file ke Google Drive dari server-side application.

## Langkah 1: Buat Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **Select a project** → **NEW PROJECT**
3. Masukkan nama project: `skripsi-mate` → Klik **CREATE**

## Langkah 2: Enable Google Drive API

1. Pastikan project `skripsi-mate` terpilih
2. Buka [API Library](https://console.cloud.google.com/apis/library)
3. Cari **Google Drive API**
4. Klik **Enable**
5. Tunggu sampai status menjadi "API enabled"

## Langkah 3: Buat Service Account

1. Buka [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Pastikan project `skripsi-mate` terpilih
3. Klik **CREATE SERVICE ACCOUNT**
4. Masukkan nama: `skripsi-mate-service`
5. Service account ID akan otomatis terisi: `skripsi-mate-service`
6. Klik **CREATE AND CONTINUE**
7. Skip bagian "Grant this service account access to this project" → Klik **DONE**
8. Service account akan muncul di list

## Langkah 4: Download Private Key

1. Klik pada email service account: `skripsi-mate-service@skripsi-mate.iam.gserviceaccount.com`
2. Buka tab **KEYS**
3. Klik **ADD KEY** → **Create new key**
4. Pilih **JSON** → Klik **CREATE**
5. File JSON akan terdownload otomatis, misalnya: `skripsi-mate-service-abc123.json`
6. **IMPORTANT**: JANGAN bagikan file ini atau commit ke repository!

Isi file JSON akan terlihat seperti ini:
```json
{
  "type": "service_account",
  "project_id": "skripsi-mate",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "skripsi-mate-service@skripsi-mate.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/skripsi-mate-service%40skripsi-mate.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
```

## Langkah 5: Setup Folder Google Drive

Ada 2 opsi:

### Opsi A: Share folder personal dengan Service Account (Recommended untuk testing)

1. Buka [Google Drive](https://drive.google.com/)
2. Buat folder baru: `SkripsiMate`
3. Klik kanan folder → **Share**
4. Copy email service account: `skripsi-mate-service@skripsi-mate.iam.gserviceaccount.com`
5. Paste di bagian "Add people and groups"
6. Pilih role: **Editor**
7. Klik **Send**
8. Klik folder `SkripsiMate` di browser → Copy folder ID dari URL:
   - URL: `https://drive.google.com/drive/u/0/folders/1ABCxyz...`
   - Folder ID: `1ABCxyz...`

### Opsi B: Share Drive (Recommended untuk production)

1. Buka [Shared Drives](https://drive.google.com/drive/shared-drives)
2. Klik **NEW** → **New shared drive**
3. Masukkan nama: `SkripsiMate Files`
4. Klik **Create**
5. Buka shared drive → Klik **Manage members**
6. Add service account email: `skripsi-mate-service@skripsi-mate.iam.gserviceaccount.com`
7. Pilih role: **Manager**
8. Copy folder ID dari URL

## Langkah 6: Set Environment Variables

### Cara 1: Update file `.env` (Local development)

Buka file `.env` dan tambahkan:

```env
# Google Service Account (copy PASTE isi file JSON)
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"skripsi-mate","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n","client_email":"skripsi-mate-service@skripsi-mate.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/skripsi-mate-service%40skripsi-mate.iam.gserviceaccount.com","universe_domain":"googleapis.com"}'

# Parent Folder ID (opsional - jika ingin semua project dalam satu folder)
GOOGLE_DRIVE_FOLDER_ID=1ABCxyz...
```

**Catatan penting:**
- Pastikan seluruh isi JSON (termasuk private_key dengan \n) di-wrap dengan **single quotes**
- Double quotes di dalam JSON harus tetap double quotes
- Jangan ada extra whitespace di dalam quotes
- Pastikan private_key sudah berisi `\n` literal (bukan newline)

### Cara 2: Set di Vercel (Production)

1. Buka [Vercel Dashboard](https://vercel.com/)
2. Pilih project → **Settings** → **Environment Variables**
3. Tambah variable baru:
   - Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - Value: PASTE isi file JSON (format sama seperti di atas)
   - Environment: **Production**, **Preview**, **Development** → **Save**
4. Tambah variable:
   - Name: `GOOGLE_DRIVE_FOLDER_ID`
   - Value: Folder ID dari Google Drive (opsional)
   - Environment: **Production**, **Preview**, **Development** → **Save**
5. Redeploy aplikasi

## Langkah 7: Test Connection

Buat file test untuk memverifikasi:

```javascript
// test-google-drive.js
const { google } = require('googleapis');

const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({ version: 'v3', auth });

async function test() {
  try {
    const folder = await drive.files.create({
      requestBody: {
        name: 'test-folder',
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id'
    });
    console.log('Folder created:', folder.data.id);
    await drive.files.delete({ fileId: folder.data.id });
    console.log('Folder deleted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

Jalankan:
```bash
GOOGLE_SERVICE_ACCOUNT_KEY='...' node test-google-drive.js
```

## Troubleshooting

### Error: "The incoming JSON object does not contain a client_email field"

**Cause:** Format JSON salah atau tidak ter-parse dengan benar

**Solution:**
- Pastikan seluruh JSON di-wrap dengan single quotes
- Cek bahwa JSON valid: Gunakan [JSON Lint](https://jsonlint.com/)
- Pastikan `client_email` field ada di dalam JSON
- Jangan escape quotes secara berlebihan

### Error: "Forbidden 403"

**Cause:** Service account tidak memiliki akses ke folder

**Solution:**
- Share folder dengan service account email
- Pastikan role minimal **Editor**
- Pastikan service account sudah di-invite

### Error: "Insufficient Permission"

**Cause:** Scope tidak tepat atau API belum di-enable

**Solution:**
- Pastikan Google Drive API sudah di-enable
- Cek scope: `https://www.googleapis.com/auth/drive.file`
- Re-generate private key jika perlu

## Best Practices

1. **Security:**
   - JANGAN commit `.env` file ke repository
   - JANGAN bagikan private key JSON
   - Gunakan environment variables di production
   - Rotate key jika terkompro

2. **Folder Structure:**
   - Gunakan folder parent terpisah untuk setiap environment (dev, staging, prod)
   - Namespace folder dengan nama project dan timestamp

3. **Error Handling:**
   - Log error dari Google API untuk debugging
   - Implement retry logic untuk network issues
   - Handle quota limits dari Google API

## Referensi

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/reference)
- [Service Accounts Documentation](https://cloud.google.com/iam/docs/service-account-overview)
- [Google Cloud Quotas](https://cloud.google.com/products/calculator)