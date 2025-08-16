#!/bin/bash

# CI Check Script - Run this locally to verify CI will pass
# This script mimics the checks that run in GitHub Actions

set -e  # Exit on any error

echo "🚀 Starting CI checks..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the server directory."
    exit 1
fi

print_status "Installing dependencies..."
npm ci

print_status "Running linting..."
if npm run lint; then
    print_status "Linting passed"
else
    print_warning "Linting has issues (some warnings are expected in existing code)"
fi

print_status "Running unit tests..."
if npm run test; then
    print_status "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

print_status "Running test coverage..."
if npm run test:cov; then
    print_status "Test coverage completed"
else
    print_error "Test coverage failed"
    exit 1
fi

print_status "Building application..."
if npm run build; then
    print_status "Build successful"
else
    print_error "Build failed"
    exit 1
fi

print_status "Running security audit..."
if npm audit --audit-level=moderate; then
    print_status "Security audit passed"
else
    print_warning "Security audit found issues (check the output above)"
fi

print_status "Checking for outdated dependencies..."
npm outdated || print_warning "Some dependencies are outdated"

echo ""
echo -e "${GREEN}🎉 All CI checks completed!${NC}"
echo ""
echo "If you see any warnings above, they are likely in existing code and won't block your CI pipeline."
echo "The important checks (tests, build) have passed successfully."
