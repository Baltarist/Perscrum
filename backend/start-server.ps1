# Scrum Coach Backend Server Starter Script
# Bu script server bağlantı sorunlarını önlemek için oluşturulmuştur

Write-Host "🚀 Scrum Coach Backend Server Başlatıcı" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# 1. Mevcut dizini kontrol et
$currentDir = Get-Location
if ($currentDir.Path -notlike "*backend*") {
    Write-Host "❌ Backend dizininde değilsiniz!" -ForegroundColor Red
    Write-Host "Lütfen backend dizinine gidin: cd C:\Projects\Perscrum\backend" -ForegroundColor Yellow
    exit 1
}

# 2. Port temizleme
Write-Host "🧹 Port 5000 temizleniyor..." -ForegroundColor Yellow
$processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   Node process'leri sonlandırılıyor..." -ForegroundColor Yellow
    $processes | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

# Port kullanımını kontrol et
$portCheck = netstat -ano | findstr ":5000"
if ($portCheck) {
    Write-Host "   Port 5000 hala kullanılıyor, manuel temizlik gerekli" -ForegroundColor Red
    Write-Host "$portCheck" -ForegroundColor Gray
}

# 3. Dependency kontrolü
Write-Host "📦 Dependencies kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   node_modules bulunamadı, npm install çalıştırılıyor..." -ForegroundColor Yellow
    npm install
}

if (-not (Test-Path ".env")) {
    Write-Host "   .env dosyası bulunamadı!" -ForegroundColor Red
    Write-Host "   Lütfen .env dosyasını oluşturun" -ForegroundColor Red
    exit 1
}

# 4. Database kontrolü
Write-Host "🗄️ Database kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "prisma/dev.db")) {
    Write-Host "   Database oluşturuluyor..." -ForegroundColor Yellow
    npx prisma generate
    npx prisma migrate dev --name init
    npx prisma db seed
}

# 5. Public klasörü kontrolü
Write-Host "📁 Public klasörü kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Name "public"
    Write-Host "   Public klasörü oluşturuldu" -ForegroundColor Green
}

# 6. Server başlatma
Write-Host ""
Write-Host "🚀 Server başlatılıyor..." -ForegroundColor Green
Write-Host "   Port: 5000" -ForegroundColor Gray
Write-Host "   Environment: development" -ForegroundColor Gray
Write-Host "   Real-time: enabled" -ForegroundColor Gray
Write-Host ""
Write-Host "📡 Bağlantı adresleri:" -ForegroundColor Cyan
Write-Host "   🏥 Health: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host "   📊 API: http://localhost:5000/api" -ForegroundColor Cyan
Write-Host "   🧪 Test: http://localhost:5000/test/realtime-test.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Server başlatılıyor... (Ctrl+C ile durdurun)" -ForegroundColor Yellow
Write-Host ""

# Server'ı başlat
try {
    npm run dev
} catch {
    Write-Host ""
    Write-Host "❌ Server başlatılamadı!" -ForegroundColor Red
    Write-Host "Hata: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Olası çözümler:" -ForegroundColor Yellow
    Write-Host "1. Port 5000 başka bir uygulama tarafından kullanılıyor olabilir" -ForegroundColor Yellow
    Write-Host "2. .env dosyasında eksik/yanlış konfigürasyon olabilir" -ForegroundColor Yellow
    Write-Host "3. node_modules eksik olabilir: npm install" -ForegroundColor Yellow
    Write-Host "4. TypeScript hatası olabilir: npx tsc --noEmit" -ForegroundColor Yellow
    exit 1
}