const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register(req, res) {
    try {
        const { name, phone, password, role, location } = req.body;

        if (!name || !phone || !password || !role) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return res.status(409).json({ message: 'Phone number already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, phone, password: hashedPassword, role, location });

        res.status(201).json({ message: 'User registered', userId: user._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function login(req, res) {
    try {
        const { phone, password } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid phone or password' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { register, login };
