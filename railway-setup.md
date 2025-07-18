# Railway Setup Instructions

## Adding PostgreSQL Database to Your Railway Project

1. Go to your Railway project dashboard
2. Click "Add Service" → "Database" → "PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set
5. Your app will automatically redeploy with the new database connection

## Environment Variables

Railway automatically provides:
- `DATABASE_URL` - Complete PostgreSQL connection string
- `NODE_ENV=production` - Set automatically in production

## Important Notes

- The API will automatically run migrations on startup
- UUID extension will be enabled automatically
- Database tables will be created on first deployment
- Sample data will be seeded if tables are empty

## Testing Your API

Once deployed, your API will be available at:
- Health check: `https://your-app.railway.app/health`
- Gadgets API: `https://your-app.railway.app/api/gadgets`
- Auth API: `https://your-app.railway.app/api/auth`

## If Problems Persist

Check Railway logs for:
1. Database connection errors
2. Migration failures
3. UUID extension issues
