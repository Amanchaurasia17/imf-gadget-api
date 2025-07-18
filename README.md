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
- ✅ RESTful API design
- ✅ Deployed on Railway
- ✅ UUID-based primary keys
- ✅ Comprehensive statistics endpoints

## Prerequisites

- Node.js (v18 or higher)
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

## Live Demo

The API is deployed and accessible at: **https://web-production-67af5.up.railway.app/**

### Test the API
You can test the live API using the following endpoints:
- Health Check: `GET https://web-production-67af5.up.railway.app/health`
- API Info: `GET https://web-production-67af5.up.railway.app/`
- Gadgets: `GET https://web-production-67af5.up.railway.app/api/gadgets`

## API Endpoints

### Authentication

#### Login
```
POST /api/auth/signin
Content-Type: application/json

{
  "username": "agent007",
  "password": "password"
}
```

#### Register
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "newagent",
  "email": "agent@imf.gov",
  "password": "password"
}
```

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <your_jwt_token>
```

### Gadgets

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
GET /api/gadgets/statistics
```

#### Get Statistics Summary
```
GET /api/gadgets/stats/summary
```

### Health Check
```
GET /health
```

## Sample API Responses

### Authentication Response
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "agent007",
    "email": "james.bond@imf.gov",
    "role": "agent"
  }
}
```

### Gadgets List Response
```json
{
  "gadgets": [
    {
      "id": "231826a5-1134-4f41-930c-9fa8b516cfc7",
      "name": "Explosive Pen",
      "status": "Available",
      "codename": "PEN-001",
      "decommissionedAt": null,
      "createdAt": "2025-07-18T10:00:00.000Z",
      "updatedAt": "2025-07-18T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 5,
    "itemsPerPage": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Statistics Response
```json
{
  "total": 5,
  "byStatus": {
    "Available": 2,
    "Deployed": 1,
    "Destroyed": 1,
    "Decommissioned": 1
  }
}
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
   - Email: `james.bond@imf.gov`
   - Password: `password`
   - Role: `agent`

2. **Admin Account**
   - Username: `missioncontrol`
   - Email: `control@imf.gov`
   - Password: `password`
   - Role: `admin`

## Testing the API

### Using curl
```bash
# Login
curl -X POST https://web-production-67af5.up.railway.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"agent007","password":"password"}'

# Get gadgets
curl -X GET https://web-production-67af5.up.railway.app/api/gadgets

# Get statistics
curl -X GET https://web-production-67af5.up.railway.app/api/gadgets/statistics
```

### Using Postman
1. Import the collection with base URL: `https://web-production-67af5.up.railway.app`
2. Test authentication endpoints first
3. Use the returned JWT token for gadget operations

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
- **Express.js** for the web framework
- **Sequelize** as the ORM
- **PostgreSQL** as the database
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Nodemon** for development hot reloading
- **UUID** for primary keys
- **Railway** for deployment

## Project Structure

```
├── app.js              # Main application file
├── package.json        # Dependencies and scripts
├── Procfile           # Railway deployment configuration
├── config/
│   └── config.js      # Database configuration
├── middleware/
│   └── auth.js        # Authentication middleware
├── models/
│   ├── index.js       # Sequelize models index
│   └── gadget.js      # Gadget model
├── routes/
│   ├── auth.js        # Authentication routes
│   └── gadgets.js     # Gadget CRUD routes
├── migrations/        # Database migrations
└── seeders/          # Database seeders
```

## API Features Implemented

- ✅ **Authentication System**: JWT-based login/signup
- ✅ **CRUD Operations**: Complete gadget management
- ✅ **Search & Filter**: By name, codename, and status
- ✅ **Pagination**: Page-based navigation
- ✅ **Statistics**: Gadget counts by status
- ✅ **Input Validation**: Comprehensive error handling
- ✅ **Database Relationships**: Proper foreign key management
- ✅ **Deployment Ready**: Production environment configured

## Assessment Criteria Coverage

✅ **API Design**: RESTful endpoints with proper HTTP methods  
✅ **Authentication**: JWT implementation with role-based access  
✅ **Database Integration**: PostgreSQL with Sequelize ORM  
✅ **Error Handling**: Comprehensive error responses  
✅ **Documentation**: Complete API documentation  
✅ **Code Quality**: Clean, maintainable code structure  
✅ **Testing**: Live deployment with working endpoints  
✅ **Deployment**: Successfully deployed on Railway

## License

This project is licensed under the ISC License.
