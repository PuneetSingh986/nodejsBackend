# Node.js Production API Project

A production-level RESTful API built with Node.js, Express, and MongoDB.

## Features

- Complete authentication system with JWT
- Role-based authorization
- Structured error handling
- Request validation
- Rate limiting to prevent abuse
- Security best practices (Helmet, CORS, etc.)
- Comprehensive logging
- API versioning
- MongoDB with Mongoose ODM
- Organized MVC architecture

## Project Structure

```
|-- src/
|   |-- config/         # Configuration files
|   |-- controllers/    # Route controllers
|   |-- middleware/     # Custom middleware
|   |-- models/         # Database models
|   |-- routes/         # API routes
|   |-- services/       # Business logic
|   |-- utils/          # Utility functions
|   |-- validators/     # Request validators
|   |-- server.js       # Entry point
|-- tests/
|   |-- unit/           # Unit tests
|   |-- integration/    # Integration tests
|-- logs/               # App logs
|-- public/             # Static files
|-- .env                # Environment variables (create from .env.example)
|-- .env.example        # Example environment variables
|-- package.json        # Dependencies and scripts
|-- README.md           # Project documentation
```

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```
   npm run dev
   ```

## Available Scripts

- `npm start` - Run the production server
- `npm run dev` - Run the development server with hot reloading
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix linting errors

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get token
- `GET /api/v1/auth/me` - Get current user (requires auth)
- `GET /api/v1/auth/logout` - Logout user (requires auth)

### Users (Admin only)

- `GET /api/v1/users` - Get all users
- `GET /api/v1/users/:id` - Get a specific user
- `POST /api/v1/users` - Create a new user
- `PUT /api/v1/users/:id` - Update a user
- `DELETE /api/v1/users/:id` - Delete a user

## Security Measures

- JWT-based authentication
- Password hashing with bcrypt
- Request rate limiting
- Input validation and sanitization
- HTTP security headers (Helmet)
- CORS protection
- MongoDB injection prevention
- Request timeouts
- Error handling without exposure of sensitive information

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in your environment
2. Update the `JWT_SECRET` to a strong random string
3. Configure proper database credentials
4. Adjust rate limiting settings based on expected traffic

## License

ISC
