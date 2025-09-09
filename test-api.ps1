# Comprehensive API Testing Script for BlogAI
# This script tests all major API endpoints and JSON data handling

$BASE_URL = "http://localhost:3003"
$timestamp = Get-Date -UFormat %s
$testEmail = "test$timestamp@example.com"

Write-Host "🚀 Starting Comprehensive API Tests for BlogAI" -ForegroundColor Green
Write-Host "=================================================="

# Test 1: Signup API
Write-Host "`n🧪 Testing Signup API..." -ForegroundColor Yellow

$signupData = @{
    name = "Test User"
    email = $testEmail
    password = "testpass123"
} | ConvertTo-Json

Write-Host "📤 Posting data: $signupData" -ForegroundColor Cyan

try {
    $signupResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/signup" -Method POST -Body $signupData -ContentType "application/json" -ErrorAction Stop
    Write-Host "📥 Response: $($signupResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    Write-Host "✅ Signup API: PASS" -ForegroundColor Green
    $authToken = $signupResponse.token
} catch {
    Write-Host "📥 Error Response: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ Signup API: FAIL" -ForegroundColor Red
    $authToken = $null
}

# Test 2: Login API  
Write-Host "`n🧪 Testing Login API..." -ForegroundColor Yellow

$loginData = @{
    email = $testEmail
    password = "testpass123"
} | ConvertTo-Json

Write-Host "📤 Posting data: $loginData" -ForegroundColor Cyan

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    Write-Host "📥 Response: $($loginResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    Write-Host "✅ Login API: PASS" -ForegroundColor Green
    if (-not $authToken) { $authToken = $loginResponse.token }
} catch {
    Write-Host "📥 Error Response: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ Login API: FAIL" -ForegroundColor Red
}

# Test 3: Get Posts API
Write-Host "`n🧪 Testing Get Posts API..." -ForegroundColor Yellow

try {
    $postsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/posts" -Method GET -ErrorAction Stop
    Write-Host "📥 Response: $($postsResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    Write-Host "✅ Get Posts API: PASS" -ForegroundColor Green
} catch {
    Write-Host "📥 Error Response: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ Get Posts API: FAIL" -ForegroundColor Red
}

# Test 4: Create Post API (if we have auth token)
if ($authToken) {
    Write-Host "`n🧪 Testing Create Post API..." -ForegroundColor Yellow
    
    $postData = @{
        title = "Test Blog Post"
        content = "This is a test blog post content for API testing."
        excerpt = "Test excerpt for the blog post"
        published = $false
    } | ConvertTo-Json
    
    Write-Host "📤 Posting data: $postData" -ForegroundColor Cyan
    
    try {
        $headers = @{ Authorization = "Bearer $authToken" }
        $createPostResponse = Invoke-RestMethod -Uri "$BASE_URL/api/posts" -Method POST -Body $postData -ContentType "application/json" -Headers $headers -ErrorAction Stop
        Write-Host "📥 Response: $($createPostResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
        Write-Host "✅ Create Post API: PASS" -ForegroundColor Green
    } catch {
        Write-Host "📥 Error Response: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "❌ Create Post API: FAIL" -ForegroundColor Red
    }
}

# Test 5: Dashboard API
Write-Host "`n🧪 Testing Dashboard API..." -ForegroundColor Yellow

try {
    $dashboardResponse = Invoke-RestMethod -Uri "$BASE_URL/api/dashboard" -Method GET -ErrorAction Stop
    Write-Host "📥 Response: $($dashboardResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    Write-Host "✅ Dashboard API: PASS" -ForegroundColor Green
} catch {
    Write-Host "📥 Error Response: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ Dashboard API: FAIL" -ForegroundColor Red
}

# Test 6: Gemini AI API
Write-Host "`n🧪 Testing Gemini AI API..." -ForegroundColor Yellow

$geminiData = @{
    prompt = "Write a short paragraph about the benefits of AI in content creation."
} | ConvertTo-Json

Write-Host "📤 Posting data: $geminiData" -ForegroundColor Cyan

try {
    $geminiResponse = Invoke-RestMethod -Uri "$BASE_URL/api/gemini" -Method POST -Body $geminiData -ContentType "application/json" -ErrorAction Stop
    Write-Host "📥 Response: $($geminiResponse | ConvertTo-Json -Depth 2)" -ForegroundColor Green
    Write-Host "✅ Gemini AI API: PASS" -ForegroundColor Green
} catch {
    Write-Host "📥 Error Response: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "❌ Gemini AI API: FAIL" -ForegroundColor Red
}

Write-Host "`n=================================================="
Write-Host "🧪 API Testing Complete!" -ForegroundColor Green
Write-Host "Check the results above to see which endpoints are working correctly." -ForegroundColor Yellow
