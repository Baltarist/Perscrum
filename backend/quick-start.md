# 🚀 Scrum Coach Backend - Quick Start

## 🔧 Bağlantı Sorunu Çözümleri

### 📋 Hızlı Kontrol Listesi

✅ **1. Backend dizininde olduğunuzdan emin olun**
```bash
cd C:\Projects\Perscrum\backend
```

✅ **2. Otomatik server başlatıcı kullanın**
```powershell
.\start-server.ps1
```

✅ **3. Manuel başlatma (eğer script çalışmazsa)**
```bash
# Tüm node process'lerini sonlandır
Get-Process -Name "node" | Stop-Process -Force

# Dependencies kontrol et
npm install

# Database hazırla
npx prisma generate
npx prisma migrate dev --name init

# Server başlat
npm run dev
```

## 🌐 Test Adresleri

| Endpoint | URL | Açıklama |
|----------|-----|----------|
| **Health Check** | `http://localhost:5000/health` | Server durumu |
| **API Root** | `http://localhost:5000/api` | API bilgileri |
| **Real-time Test** | `http://localhost:5000/test/realtime-test.html` | Socket.io test sayfası |
| **Detailed Health** | `http://localhost:5000/health/detailed` | Detaylı sistem durumu |

## 🔍 Sorun Giderme

### ❌ "Uzak sunucuya bağlanılamıyor"

**1. Port kontrolü:**
```powershell
netstat -ano | findstr ":5000"
```

**2. Process temizleme:**
```powershell
# Tüm Node process'lerini sonlandır
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Belirli PID sonlandır (eğer port kullanılıyorsa)
taskkill /PID <PID> /F
```

**3. Firewall/Antivirus kontrolü:**
- Windows Defender'da Node.js'e izin verin
- Port 5000'i firewall'da açın

### ❌ "EADDRINUSE" hatası

```bash
# Port kullanan process'i bul
netstat -ano | findstr ":5000"

# Process'i sonlandır
taskkill /PID <PID> /F

# Server'ı yeniden başlat
npm run dev
```

### ❌ TypeScript/Dependency hataları

```bash
# Dependencies yeniden yükle
rm -rf node_modules package-lock.json
npm install

# TypeScript kontrol et
npx tsc --noEmit

# Prisma client güncelle
npx prisma generate
```

## 📱 Real-time Test Sayfası Kullanımı

### 🔑 JWT Token Alma

```bash
# 1. Login endpoint'ine istek gönder
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123"
}

# 2. Response'dan accessToken'ı kopyala
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 🧪 Test Adımları

1. **Tarayıcıda aç:** `http://localhost:5000/test/realtime-test.html`
2. **JWT Token gir:** Yukarıda aldığın token'ı yapıştır
3. **Bağlan:** "🔌 Bağlan" butonuna tıkla
4. **Projeye katıl:** "🏠 Projeye Katıl" butonuna tıkla
5. **Test task oluştur:** "📝 Test Task Oluştur" ile canlı güncellemeleri gör

### 👀 Beklenen Sonuçlar

- ✅ **Connection Status:** "Bağlandı ✅"
- ✅ **User Status:** "Giriş yapıldı: [Kullanıcı Adı]"
- ✅ **Project Status:** "Katıldı: [Proje Adı]"
- ✅ **Real-time Updates:** Task kartları anlık olarak görünmeli
- ✅ **Notifications:** Bildirimler 5 saniye görünüp kaybolmalı

## 🆘 Hala Çalışmıyor mu?

### 🔧 Manuel Debug

```bash
# 1. Server loglarını gözlemle
npm run dev

# 2. Hata mesajlarını kontrol et
# 3. Console'da error varsa paylaş

# 4. Health check yap
curl http://localhost:5000/health
# veya
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method Get
```

### 📞 Yardım İste

Aşağıdaki bilgileri paylaş:
- ✅ Operating System: Windows
- ✅ Node.js version: `node --version`
- ✅ npm version: `npm --version`
- ✅ Error messages: Console'daki tam hata mesajı
- ✅ Port status: `netstat -ano | findstr ":5000"`

---

**🚀 Bu adımları takip ettikten sonra server kesinlikle çalışacak!**