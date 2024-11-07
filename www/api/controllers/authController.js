const AdminUser = require('../models/AdminModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

exports.register = async (req, res) => {
    try {
        const { username, password, role , email, fullname, phone} = req.body;

        // ตรวจสอบว่ามีข้อมูลครบถ้วนหรือไม่
        if (!username || !password || !role) {
            return res.status(400).json({ error: 'All fields are required: username, password, role' });
        }

        // ตรวจสอบความยาวของรหัสผ่าน
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // ตรวจสอบว่า username ซ้ำหรือไม่
        let user = await AdminUser.findOne({ username });
        if (user) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // ทำการเข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้างผู้ใช้ใหม่
        user = new AdminUser({
            username: username,
            password: hashedPassword,
            role: role,
            email: email,
            fullname: fullname,
            phone: phone,
            createdAt: new Date(),
            isActive: true
        });

        // บันทึกผู้ใช้ในฐานข้อมูล
        await user.save();

        return res.status(201).json({ message: 'User registered successfully', user: user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred during registration' });
    }
};


exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // ตรวจสอบว่ามีการกรอกข้อมูล username และ password ครบถ้วนหรือไม่
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // ตรวจสอบว่า username มีอยู่ในฐานข้อมูลหรือไม่
        const user = await AdminUser.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // ตรวจสอบว่ารหัสผ่านถูกต้องหรือไม่
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // สร้าง JWT token
        const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // ส่ง token กลับไปยังผู้ใช้
        return res.status(200).json({ message: 'Login successful' , token: token , user: user , role: user.role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred during login' });
    }
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
        const user = await AdminUser.findOne({ username: req.user.username });
        if (!user) return res.status(404).send('User not found');
        res.json({ username: user.username });
    } catch (err) {
        res.status(500).send('Server error');
    }
};