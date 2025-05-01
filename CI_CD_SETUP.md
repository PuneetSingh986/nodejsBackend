# CI/CD Pipeline Setup

This project includes a comprehensive Continuous Integration and Continuous Deployment (CI/CD) pipeline using GitHub Actions.

## Overview

The pipeline automates the following processes:

1. **Testing**: Run linting and automated tests
2. **Building**: Create and push Docker images
3. **Staging Deployment**: Automatically deploy to staging environment
4. **Production Deployment**: Deploy to production with manual approval

## Pipeline Workflow

```
Code Changes → Tests → Build Docker Image → Deploy to Staging → Manual Approval → Deploy to Production
```

## Prerequisites

To use this CI/CD pipeline, you need:

1. **GitHub Repository**: Host your code on GitHub
2. **GitHub Secrets**: Configure the following secrets in your repository:

   - `STAGING_HOST`: Hostname/IP of your staging server
   - `STAGING_USERNAME`: SSH username for staging server
   - `STAGING_SSH_KEY`: SSH private key for staging server
   - `PRODUCTION_HOST`: Hostname/IP of your production server
   - `PRODUCTION_USERNAME`: SSH username for production server
   - `PRODUCTION_SSH_KEY`: SSH private key for production server

3. **Docker Registry**: By default, GitHub Container Registry (ghcr.io) is used

## Environments Setup

In your GitHub repository:

1. Go to Settings → Environments
2. Create two environments:
   - `staging` (no additional protection)
   - `production` (enable "Required reviewers")
3. Add any environment-specific variables or secrets

## Pipeline Stages

### 1. Test

- Runs on every push and pull request
- Sets up Node.js and MongoDB
- Installs dependencies
- Runs linting and tests

### 2. Build

- Runs after successful tests
- Uses Docker Buildx for efficient builds
- Builds the production Docker image
- Pushes to GitHub Container Registry
- Uses layer caching for faster builds

### 3. Deploy to Staging

- Automatically deploys to staging after successful build
- Pulls the latest Docker image
- Restarts containers using docker-compose
- Performs health checks to verify deployment
- Fails if health checks don't pass

### 4. Deploy to Production

- Requires manual approval in GitHub
- Creates database backup before deployment
- Deploys to production using docker-compose
- Includes automatic rollback if health checks fail
- Reports deployment status

## Customization

### Changing Docker Registry

To use Docker Hub instead of GitHub Container Registry:

1. Update the `docker/login-action` in `.github/workflows/ci-cd.yml`:

   ```yaml
   - name: Login to Docker Hub
     uses: docker/login-action@v2
     with:
       registry: docker.io
       username: ${{ secrets.DOCKERHUB_USERNAME }}
       password: ${{ secrets.DOCKERHUB_TOKEN }}
   ```

2. Update the image name in the metadata action:
   ```yaml
   images: docker.io/yourusername/${{ env.DOCKER_IMAGE }}
   ```

### Adapting for Kubernetes

To deploy to Kubernetes instead of using SSH:

1. Add Kubernetes credentials as secrets
2. Replace the SSH deployment steps with kubectl commands:

   ```yaml
   - name: Set Kubernetes Context
     uses: azure/k8s-set-context@v1
     with:
       kubeconfig: ${{ secrets.KUBE_CONFIG }}

   - name: Deploy to Kubernetes
     run: |
       kubectl apply -f k8s/deployment.yml
       kubectl rollout status deployment/nodejs-api
   ```

## Manual Triggering

You can manually trigger the pipeline:

1. Go to Actions tab in your GitHub repository
2. Select "CI/CD Pipeline"
3. Click "Run workflow"
4. Choose the branch to run the workflow on

## Monitoring Deployments

1. Go to the Environments section in your GitHub repository
2. Click on the environment (staging or production)
3. View current and past deployments
4. Access deployment logs and history

## Troubleshooting

### Failed Tests

- Check the test logs in the GitHub Actions output
- Fix the failing tests locally before pushing again

### Failed Deployments

- Check the deployment logs in GitHub Actions
- Verify server connectivity and permissions
- Ensure docker-compose files are correctly configured
- Check that health check endpoints are working

### Manual Deployment

If the CI/CD pipeline fails, you can still deploy manually:

```bash
# SSH into your server
ssh user@hostname

# Pull the latest changes
cd /path/to/deployment
git pull

# Rebuild and restart containers
docker-compose up -d --build
```
