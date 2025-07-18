const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({
            error: 'Access denied',
            message: 'No token provided'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Invalid token',
                message: 'Token is invalid or expired'
            });
        }
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }
    next();
};

const requireAgent = (req, res, next) => {
    if (!req.user || !['agent', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Agent access required'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireAgent
};
