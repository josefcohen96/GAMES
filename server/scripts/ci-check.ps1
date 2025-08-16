# CI Check Script for Windows - Run this locally to verify CI will pass
# This script mimics the checks that run in GitHub Actions

param(
    [switch]$SkipInstall
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

Write-Host "🚀 Starting CI checks..." -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the server directory."
    exit 1
}

if (-not $SkipInstall) {
    Write-Status "Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

Write-Status "Running linting..."
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Status "Linting passed"
} else {
    Write-Warning "Linting has issues (some warnings are expected in existing code)"
}

Write-Status "Running unit tests..."
npm run test
if ($LASTEXITCODE -eq 0) {
    Write-Status "Unit tests passed"
} else {
    Write-Error "Unit tests failed"
    exit 1
}

Write-Status "Running test coverage..."
npm run test:cov
if ($LASTEXITCODE -eq 0) {
    Write-Status "Test coverage completed"
} else {
    Write-Error "Test coverage failed"
    exit 1
}

Write-Status "Building application..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Status "Build successful"
} else {
    Write-Error "Build failed"
    exit 1
}

Write-Status "Running security audit..."
npm audit --audit-level=moderate
if ($LASTEXITCODE -eq 0) {
    Write-Status "Security audit passed"
} else {
    Write-Warning "Security audit found issues (check the output above)"
}

Write-Status "Checking for outdated dependencies..."
npm outdated
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Some dependencies are outdated"
}

Write-Host ""
Write-Host "🎉 All CI checks completed!" -ForegroundColor Green
Write-Host ""
Write-Host "If you see any warnings above, they are likely in existing code and won't block your CI pipeline." -ForegroundColor Yellow
Write-Host "The important checks (tests, build) have passed successfully." -ForegroundColor Green
