const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('../controllers/authController');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Access Denied');
    if (isTokenBlacklisted(token)) return res.status(403).send('Token is blacklisted');

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid Token');
        req.user = user;
        next();
    });
};

module.exports = authenticateToken;