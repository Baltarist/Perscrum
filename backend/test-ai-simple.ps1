# AI Test Script - Basit Test
Write-Host "🧪 AI Test Script başlıyor..." -ForegroundColor Green

# 1. Backend durumu kontrol
Write-Host "1. Backend durumu kontrol ediliyor..." -ForegroundColor Yellow
$portCheck = netstat -an | findstr :5000
if ($portCheck) {
    Write-Host "✅ Backend çalışıyor (Port 5000 aktif)" -ForegroundColor Green
} else {
    Write-Host "❌ Backend çalışmıyor" -ForegroundColor Red
    exit
}

# 2. Login test
Write-Host "2. Login test..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "alex@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login başarılı!" -ForegroundColor Green
    $token = $loginResponse.data.tokens.accessToken
    Write-Host "🔑 Token alındı: $($token.Substring(0,20))..." -ForegroundColor Blue
} catch {
    Write-Host "❌ Login hatası: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# 3. AI Health Check
Write-Host "3. AI Health Check..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/ai/health" -Method Get -Headers $headers
    Write-Host "✅ AI Health Check başarılı!" -ForegroundColor Green
    
    if ($healthResponse.data.aiEnabled) {
        Write-Host "🤖 AI Enabled: $($healthResponse.data.aiEnabled)" -ForegroundColor Green
        Write-Host "🔑 Has API Key: $($healthResponse.data.hasApiKey)" -ForegroundColor Green
        Write-Host "📊 Model: $($healthResponse.data.model)" -ForegroundColor Blue
        Write-Host "⚡ Status: $($healthResponse.data.status)" -ForegroundColor Blue
    } else {
        Write-Host "❌ AI devre dışı" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ AI Health Check hatası: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. AI Task Suggestions Test (sadece AI çalışıyorsa)
if ($healthResponse.data.status -eq "operational") {
    Write-Host "4. AI Task Suggestions test..." -ForegroundColor Yellow
    try {
        $taskBody = @{
            projectId = "4790e528-5403-4394-bab3-ab7b07ac73b1"
            context = "JavaScript web development project"
        } | ConvertTo-Json
        
        $taskResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/ai/task-suggestions" -Method Post -Body $taskBody -ContentType "application/json" -Headers $headers
        Write-Host "🚀 AI Task Suggestions başarılı!" -ForegroundColor Green
        Write-Host "📝 Önerilen task sayısı: $($taskResponse.data.count)" -ForegroundColor Blue
        Write-Host "📋 İlk öneri: $($taskResponse.data.suggestions[0])" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ AI Task Suggestions hatası: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "🔍 Detay hata:" -ForegroundColor Yellow
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host $errorDetail.error.message -ForegroundColor Yellow
    }
}

Write-Host "🏁 Test tamamlandı!" -ForegroundColor Green