# IMF Gadget API

A RESTful API for managing IMF (Impossible Mission Force) gadgets. This API allows you to track gadgets with various statuses and provides authentication for secure access.

## Features

- ✅ CRUD operations for gadgets
- ✅ Authentication with JWT tokens
- ✅ Status tracking (Available, Deployed, Destroyed, Decommissioned)
- ✅ Search and filtering capabilities
- ✅ Pagination support
- ✅ Input validation and error handling
- ✅ PostgreSQL database with Sequelize ORM

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `imf_gadgets`

4. Configure your environment variables by copying `.env.example` to `.env` and updating the values:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your actual database credentials:
   ```
   PORT=3000
   NODE_ENV=development
   
   # Database Configuration
   DB_USERNAME=postgres
   DB_PASSWORD=your_database_password
   DB_NAME=imf_gadgets
   DB_TEST_NAME=imf_gadgets_test
   DB_PROD_NAME=imf_gadgets_prod
   DB_HOST=127.0.0.1
   
   # JWT Secret
   JWT_SECRET=your_super_secret_jwt_key_here
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
   ```

6. Seed the database with sample data (optional):
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "agent007",
  "password": "password"
}
```

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "newagent",
  "email": "agent@imf.gov",
  "password": "password"
}
```

### Gadgets

All gadget endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### Get All Gadgets
```
GET /api/gadgets?page=1&limit=10&status=Available&search=laser
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status
- `search` (optional): Search by name or codename
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): ASC or DESC (default: DESC)

#### Get Gadget by ID
```
GET /api/gadgets/:id
```

#### Create New Gadget
```
POST /api/gadgets
Content-Type: application/json

{
  "name": "Explosive Pen",
  "codename": "PEN-001",
  "status": "Available"
}
```

#### Update Gadget
```
PUT /api/gadgets/:id
Content-Type: application/json

{
  "name": "Updated Explosive Pen",
  "codename": "PEN-001-V2",
  "status": "Deployed"
}
```

#### Delete Gadget
```
DELETE /api/gadgets/:id
```

#### Decommission Gadget
```
PATCH /api/gadgets/:id/decommission
```

#### Get Gadget Statistics
```
GET /api/gadgets/stats/summary
```

### Health Check
```
GET /health
```

## Gadget Status Values

- `Available`: Ready for deployment
- `Deployed`: Currently in use by an agent
- `Destroyed`: Gadget has been destroyed
- `Decommissioned`: Retired from service

## Default User Accounts

For testing purposes, the following accounts are available:

1. **Agent Account**
   - Username: `agent007`
   - Password: `password`
   - Role: `agent`

2. **Admin Account**
   - Username: `missioncontrol`
   - Password: `password`
   - Role: `admin`

## Database Scripts

- `npm run db:migrate` - Run pending migrations
- `npm run db:migrate:undo` - Undo last migration
- `npm run db:seed` - Run all seeders
- `npm run db:reset` - Reset database (undo all migrations, migrate, and seed)

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development

This project uses:
- Express.js for the web framework
- Sequelize as the ORM
- PostgreSQL as the database
- JWT for authentication
- bcryptjs for password hashing
- Nodemon for development hot reloading

## License

This project is licensed under the ISC License.
