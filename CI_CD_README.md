# 🚀 CI/CD Pipeline Documentation

This document explains the Continuous Integration and Continuous Deployment (CI/CD) setup for the Games Lobby API project.

## 📋 Overview

The CI/CD pipeline consists of several GitHub Actions workflows that automate the development, testing, and deployment processes.

## 🔧 Workflows

### 1. Backend CI (`backend-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Only when changes are made to `server/` directory

**Jobs:**

#### Lint and Test
- **Linting:** Runs ESLint to check code quality
- **Formatting:** Checks Prettier formatting
- **Unit Tests:** Runs Jest unit tests with coverage
- **E2E Tests:** Runs end-to-end tests
- **Database:** Uses PostgreSQL service container for tests
- **Coverage:** Uploads coverage reports to Codecov

#### Build
- **Dependencies:** Installs npm dependencies
- **Build:** Compiles TypeScript to JavaScript
- **Artifacts:** Uploads build artifacts for deployment

#### Security Scan
- **NPM Audit:** Checks for known vulnerabilities
- **Snyk Scan:** Advanced security scanning (requires SNYK_TOKEN)

#### Dependency Update
- **Scheduled:** Runs weekly to check for outdated dependencies
- **Automated PRs:** Creates pull requests for updates

### 2. Backend Deployment (`backend-deploy.yml`)

**Triggers:**
- Push to `main` branch (production)
- Manual workflow dispatch

**Environments:**
- **Staging:** Deploys from `develop` branch
- **Production:** Deploys from `main` branch

**Features:**
- **Docker Build:** Multi-stage Docker builds
- **Registry Push:** Pushes to container registry
- **Health Checks:** Verifies deployment health
- **Releases:** Creates GitHub releases for production

## 🐳 Docker Setup

### Backend Dockerfile
- **Multi-stage build** for optimization
- **Production-ready** with security best practices
- **Health checks** for monitoring
- **Non-root user** for security

### Frontend Dockerfile
- **Development mode** for local development
- **Production build** with Nginx serving
- **Static file optimization**

### Docker Compose
- **Local development** environment
- **Database persistence** with volumes
- **Health checks** for service dependencies
- **Hot reload** for development

## 🔐 Environment Variables

### Required Secrets (GitHub)

#### Database
```
STAGING_DB_HOST=your-staging-db-host
STAGING_DB_PORT=5432
STAGING_DB_USER=your-staging-db-user
STAGING_DB_PASS=your-staging-db-password
STAGING_DB_NAME=your-staging-db-name

PROD_DB_HOST=your-prod-db-host
PROD_DB_PORT=5432
PROD_DB_USER=your-prod-db-user
PROD_DB_PASS=your-prod-db-password
PROD_DB_NAME=your-prod-db-name
```

#### JWT
```
STAGING_JWT_SECRET=your-staging-jwt-secret
PROD_JWT_SECRET=your-prod-jwt-secret
```

#### Container Registry
```
REGISTRY_URL=your-registry-url
REGISTRY_USERNAME=your-registry-username
REGISTRY_PASSWORD=your-registry-password
```

#### Security
```
SNYK_TOKEN=your-snyk-token
```

## 🚀 Getting Started

### 1. Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 2. Manual Testing

```bash
# Run tests locally
cd server
npm run test
npm run test:e2e

# Run linting
npm run lint

# Check formatting
npx prettier --check "src/**/*.ts"
```

### 3. Building Docker Images

```bash
# Build backend
cd server
docker build -t games-backend:latest .

# Build frontend
cd client
docker build -t games-frontend:latest .
```

## 📊 Monitoring and Quality Gates

### Code Coverage
- **Minimum:** 80% coverage required
- **Reports:** Uploaded to Codecov
- **Badges:** Displayed in README

### Security
- **Vulnerability scanning** on every build
- **Dependency updates** automated
- **Security headers** in production

### Performance
- **Build optimization** with multi-stage builds
- **Asset compression** with Gzip
- **Caching strategies** for static files

## 🔄 Deployment Process

### Staging Deployment
1. **Trigger:** Push to `develop` branch
2. **Tests:** Run full test suite
3. **Build:** Create Docker image
4. **Deploy:** Update staging environment
5. **Verify:** Health checks and smoke tests

### Production Deployment
1. **Trigger:** Push to `main` branch
2. **Prerequisites:** Staging deployment must succeed
3. **Tests:** Run production tests
4. **Build:** Create production Docker image
5. **Deploy:** Blue-green deployment
6. **Release:** Create GitHub release
7. **Monitor:** Post-deployment verification

## 🛠 Customization

### Adding New Tests
1. Create test files in `server/src/**/*.spec.ts`
2. Add E2E tests in `server/test/`
3. Update coverage thresholds if needed

### Modifying Deployment
1. Edit deployment commands in workflow files
2. Update environment variables
3. Modify Docker configurations

### Adding New Services
1. Update `docker-compose.yml`
2. Add service-specific workflows
3. Update environment configurations

## 📝 Best Practices

### Code Quality
- **Lint before commit** using pre-commit hooks
- **Write tests** for new features
- **Maintain coverage** above 80%
- **Follow TypeScript** best practices

### Security
- **Never commit secrets** to version control
- **Use environment variables** for configuration
- **Regular dependency updates**
- **Security scanning** on every build

### Performance
- **Optimize Docker images** with multi-stage builds
- **Use caching** for dependencies
- **Monitor resource usage**
- **Implement health checks**

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check logs
docker-compose logs backend

# Rebuild without cache
docker-compose build --no-cache backend
```

#### Test Failures
```bash
# Run tests with verbose output
npm run test -- --verbose

# Check database connection
docker-compose exec postgres psql -U postgres -d games_db
```

#### Deployment Issues
```bash
# Check workflow logs in GitHub Actions
# Verify environment variables
# Check service health
```

### Getting Help
1. Check GitHub Actions logs
2. Review Docker Compose logs
3. Verify environment variables
4. Check service health endpoints

## 📈 Future Improvements

- [ ] **Kubernetes deployment** manifests
- [ ] **Monitoring and alerting** integration
- [ ] **Performance testing** in CI
- [ ] **Automated rollback** on failures
- [ ] **Multi-region deployment**
- [ ] **Database migration** automation
