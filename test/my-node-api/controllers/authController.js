const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

exports.register = async (req, res) => {
    const { username, password } = req.body;

    let user = await User.findOne({ username });
    if (user) return res.status(400).send('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, password: hashedPassword });

    await user.save();
    res.status(201).send('User registered successfully');
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid username or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid username or password');

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
};

exports.home = (req, res) => {
    res.send('Home Page');
};

let blacklistedTokens = [];

exports.logout = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).send('Access Denied');
    
    try {
        jwt.verify(token, JWT_SECRET);
        blacklistedTokens.push(token);
        res.send('Logged out successfully');
    } catch (err) {
        res.status(400).send('Invalid Token');
    }
};

exports.isTokenBlacklisted = (token) => {
    return blacklistedTokens.includes(token);
};

exports.getUserData = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });
        if (!user) return res.status(404).send('User not found');
        res.json({ username: user.username });
    } catch (err) {
        res.status(500).send('Server error');
    }
};