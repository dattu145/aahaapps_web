require('dotenv').config();
const express = require('express');
const cors = require('cors');

const Card = require('./models/Card');
const Setting = require('./models/Setting');
const Menu = require('./models/Menu');
const User = require('./models/User');

const cardRoutes = require('./routes/cardRoutes');
const settingRoutes = require('./routes/settingRoutes');
const menuRoutes = require('./routes/menuRoutes');
const userRoutes = require('./routes/userRoutes');

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* ================================
   Ensure uploads directory exists
================================ */
// On cPanel/Passenger, process.cwd() might be the root of the user or the app root
// We explicitly define it relative to THIS file (__dirname is server/ or server/something)
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory at:', uploadDir);
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (e) {
        console.error('Failed to create uploads dir:', e);
    }
} else {
    console.log('Uploads directory exists at:', uploadDir);
}

/* ================================
   Middleware
================================ */
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadDir));

/* ================================
   API Routes
================================ */
app.use('/api/cards', cardRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));

/* ================================
   Serve React (Vite) build
================================ */
const publicDir = path.join(__dirname, 'public');
console.log('Serving static files from:', publicDir);

try {
    if (fs.existsSync(publicDir)) {
        console.log('Public dir contents:', fs.readdirSync(publicDir));
    } else {
        console.warn('Public dir does NOT exist!');
    }
} catch (err) {
    console.error('Error checking public dir:', err);
}

// Add CSP header to allow content
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'"
    );
    next();
});

app.use(express.static(publicDir));

// SPA fallback
app.get(/.*/, (req, res) => {
    const indexPath = path.join(publicDir, 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.error('Index file missing at:', indexPath);
        return res
            .status(500)
            .send('Frontend build missing. Please redeploy.');
    }

    res.sendFile(indexPath);
});

/* ================================
   Start server
================================ */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
