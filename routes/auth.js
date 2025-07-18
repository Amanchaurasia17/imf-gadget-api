const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Test route to check if auth routes are working
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working!', timestamp: new Date().toISOString() });
});

const users = [
    {
        id: 1,
        username: 'agent007',
        email: 'james.bond@imf.gov',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'agent'
    },
    {
        id: 2,
        username: 'missioncontrol',
        email: 'control@imf.gov',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
        role: 'admin'
    }
];

router.get('/login', (req, res) => {
    res.json({ 
        message: 'Login endpoint - use POST with username/password',
        method: 'POST',
        expectedBody: {
            username: 'agent007 or james.bond@imf.gov',
            password: 'password'
        }
    });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Username and password are required'
            });
        }

        const user = users.find(u => u.username === username || u.email === username);
        if (!user) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid username or password'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'imf-gadget-secret-key-2025',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: 'Internal server error'
        });
    }
});

router.get('/register', (req, res) => {
    res.json({ 
        message: 'Registration endpoint - use POST with username/email/password',
        method: 'POST',
        expectedBody: {
            username: 'your_username',
            email: 'your_email@example.com',
            password: 'your_password'
        }
    });
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;


        if (!username || !email || !password) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Username, email, and password are required'
            });
        }

        const existingUser = users.find(u => u.username === username || u.email === email);
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'Username or email already taken'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: users.length + 1,
            username,
            email,
            password: hashedPassword,
            role: 'agent'
        };

        users.push(newUser);

        const token = jwt.sign(
            { 
                userId: newUser.id, 
                username: newUser.username, 
                role: newUser.role 
            },
            process.env.JWT_SECRET || 'imf-gadget-secret-key-2025',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'Internal server error'
        });
    }
});

router.get('/verify', authenticateToken, (req, res) => {
    res.json({
        message: 'Token is valid',
        user: req.user
    });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({
            error: 'Access denied',
            message: 'No token provided'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'imf-gadget-secret-key-2025', (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid token',
                message: 'Token is invalid or expired'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = router;
