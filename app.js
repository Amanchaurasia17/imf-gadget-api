const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});


const gadgetRoutes = require('./routes/gadgets');
const authRoutes = require('./routes/auth');


app.use('/api/gadgets', gadgetRoutes);
app.use('/api/auth', authRoutes);


app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'IMF Gadget API is running',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to IMF Gadget API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            gadgets: '/api/gadgets',
            auth: '/api/auth'
        }
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});


app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The endpoint ${req.originalUrl} does not exist`
    });
});


const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
        
        // Run migrations in production (Railway)
        if (process.env.NODE_ENV === 'production') {
            console.log('🔄 Running database migrations...');
            const { execSync } = require('child_process');
            try {
                execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
                console.log('✅ Database migrations completed successfully.');
                
                // Run seeders only if no data exists
                const gadgetCount = await sequelize.models.Gadget.count();
                if (gadgetCount === 0) {
                    console.log('🌱 Seeding database with initial data...');
                    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
                    console.log('✅ Database seeding completed successfully.');
                } else {
                    console.log('📊 Database already contains data, skipping seeding.');
                }
            } catch (migrationError) {
                console.error('❌ Database migration/seeding error:', migrationError.message);
                // Don't exit - let the app start anyway
            }
        } else {
            // Sync database in development
            await sequelize.sync({ alter: false });
            console.log('✅ Database synchronized successfully.');
        }
        
        // Start server (bind to 0.0.0.0 for Railway)
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 IMF Gadget API server is running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            if (process.env.NODE_ENV === 'production') {
                console.log(`🌐 API available at: ${process.env.RAILWAY_STATIC_URL || 'Railway URL'}`);
            } else {
                console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            }
        });
        
        return server;
    } catch (error) {
        console.error(' Unable to start server:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await sequelize.close();
    process.exit(0);
});

startServer();

module.exports = app;
