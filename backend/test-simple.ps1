Write-Host "AI Test Script" -ForegroundColor Green

# 1. Backend kontrol
Write-Host "1. Backend kontrol..." -ForegroundColor Yellow
$port = netstat -an | findstr :5000
if ($port) {
    Write-Host "Backend calisiyor" -ForegroundColor Green
} else {
    Write-Host "Backend calismiyor" -ForegroundColor Red
    exit
}

# 2. Login
Write-Host "2. Login..." -ForegroundColor Yellow
$loginBody = '{"email":"alex@example.com","password":"password123"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
Write-Host "Login basarili" -ForegroundColor Green
$token = $loginResponse.data.tokens.accessToken

# 3. AI Health
Write-Host "3. AI Health Check..." -ForegroundColor Yellow
$headers = @{"Authorization" = "Bearer $token"}
$health = Invoke-RestMethod -Uri "http://localhost:5000/api/ai/health" -Method Get -Headers $headers
Write-Host "AI Status: $($health.data.status)" -ForegroundColor Blue
Write-Host "AI Enabled: $($health.data.aiEnabled)" -ForegroundColor Blue
Write-Host "Model: $($health.data.model)" -ForegroundColor Blue

# 4. AI Task Test
if ($health.data.status -eq "operational") {
    Write-Host "4. AI Task Test..." -ForegroundColor Yellow
    $taskBody = '{"projectId":"4790e528-5403-4394-bab3-ab7b07ac73b1","context":"JavaScript project"}'
    $task = Invoke-RestMethod -Uri "http://localhost:5000/api/ai/task-suggestions" -Method Post -Body $taskBody -ContentType "application/json" -Headers $headers
    Write-Host "AI Task Count: $($task.data.count)" -ForegroundColor Green
    Write-Host "First Suggestion: $($task.data.suggestions[0])" -ForegroundColor Cyan
}

Write-Host "Test Complete!" -ForegroundColor Green