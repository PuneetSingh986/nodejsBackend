# Docker Setup for Node.js API

This project includes Docker configuration for both development and production environments.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

1. **Build and start the containers**:

   ```
   docker-compose up -d
   ```

2. **View the logs**:

   ```
   docker-compose logs -f api
   ```

3. **Stop the containers**:
   ```
   docker-compose down
   ```

## Development Mode

The default configuration is set to development mode, which includes:

- Hot reloading with nodemon
- Debug-level logging
- Mapped volume for logs

To start in development mode:

```
docker-compose up -d
```

For live code changes during development, uncomment this line in docker-compose.yml:

```
# - .:/app:delegated
```

## Production Mode

To run in production mode:

1. Create a `.env` file with production settings
2. Build and run with the production target:
   ```
   NODE_ENV=production docker-compose up -d --build
   ```

For a production environment, consider:

- Setting strong passwords in the `.env` file
- Enabling MongoDB authentication
- Using a volume for MongoDB data
- Setting up proper network security

## Environment Variables

You can configure the application using environment variables in a `.env` file or by passing them to the docker-compose command:

| Variable        | Description                          | Default                          |
| --------------- | ------------------------------------ | -------------------------------- |
| NODE_ENV        | Environment (development/production) | development                      |
| PORT            | Port the API runs on                 | 3000                             |
| MONGO_URI       | MongoDB connection string            | mongodb://mongo:27017/nodejs-api |
| JWT_SECRET      | Secret for JWT tokens                | your_super_secure_jwt_secret_key |
| JWT_EXPIRE      | JWT token expiration                 | 1d                               |
| RATE_LIMIT_TIME | Rate limit window in minutes         | 15                               |
| RATE_LIMIT_MAX  | Maximum requests per window          | 100                              |
| PAPERTRAIL_HOST | Papertrail host (optional)           | -                                |
| PAPERTRAIL_PORT | Papertrail port (optional)           | -                                |

## Accessing the API

Once running, the API is available at:

- http://localhost:3000/api/v1

## Persistent Data

The following data is persisted:

- **MongoDB data**: Stored in a Docker volume (`mongodb-data`)
- **Logs**: Mapped to the local `./logs` directory

## Troubleshooting

1. **Container won't start**:
   Check the logs with `docker-compose logs api`

2. **MongoDB connection issues**:
   Ensure the MongoDB container is running with `docker-compose ps`

3. **Permission issues with logs**:
   Make sure the `logs` directory exists and has write permissions:

   ```
   mkdir -p logs
   chmod 777 logs
   ```

4. **Port conflicts**:
   If port 3000 is already in use, change it in the docker-compose.yml file:
   ```
   ports:
     - "8080:3000"  # Change 3000 to any available port
   ```
