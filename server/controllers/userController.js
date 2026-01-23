const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_this';

// Temporary in-memory OTP store (better: use Redis or DB)
const otpStore = new Map(); // email -> otp mapping

// Register (for initial setup)
exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email: req.body.email, password: hashedPassword });

        res.status(201).json({ message: 'User created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, username, password } = req.body;

    // Simple file logger
    const logPath = path.join(__dirname, '../server.log');
    const log = (msg) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${msg}`); // ALSO LOG TO CONSOLE
        try { fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`); } catch (e) { console.error('Log write failed:', e); }
    };

    log(`LOGIN_ATTEMPT: Email=${email}, User=${username}`);

    try {
        // Find user by username
        const user = await User.findByUsername(username);

        if (!user) {
            log(`FAIL: User not found: ${username}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if email matches (Case insensitive)
        const dbEmail = user.email || '';
        if (dbEmail.toLowerCase() !== email.toLowerCase()) {
            log(`FAIL: Email mismatch. DB=${dbEmail}, Input=${email}`);
            return res.status(400).json({ message: 'Invalid credentials (email mismatch)' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            log(`FAIL: Password mismatch for ${username}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        log(`SUCCESS: Login successful for ${username}`);
        const token = jwt.sign({ id: user.id, username: user.name, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, username: user.name, email: user.email });

    } catch (error) {
        log(`ERROR: ${error.message}`);
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    const { id } = req.user; // From Auth Middleware
    const { username, password, email } = req.body;

    try {
        let updateData = { username, email };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await User.update(id, updateData);
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Send Verification OTP
exports.sendVerificationOtp = async (req, res) => {
    const email = req.user.email;
    const { action } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'No email found for your account.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[DEBUG] Generated OTP for ${email}: ${otp}`); // Log OTP for testing

    // Store OTP in memory (valid for 10 mins)
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60000 });

    // DISABLED BREVO EMAIL SERVICE AS REQUESTED
    // try {
    //     await emailService.sendEmail(
    //         email,
    //         `Verification OTP for ${action}`,
    //         `<p>Your OTP is: <strong>${otp}</strong></p><p>This code is valid for 10 minutes.</p>`
    //     );
    res.json({ success: true, message: 'OTP Generated (Check Console/Logs) - Email Service Disabled' });
    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'Failed to send email. Check server logs.' });
    // }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
    // Bypass OTP check if user wants (optional). For now, we will verify the logged OTP.
    const email = req.user.email;
    const { otp } = req.body;

    const storedData = otpStore.get(email);

    if (!storedData) {
        return res.status(400).json({ success: false, message: 'No OTP requested or expired' });
    }

    if (Date.now() > storedData.expires) {
        otpStore.delete(email);
        return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    if (storedData.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    res.json({ success: true, message: 'Verified' });
};
