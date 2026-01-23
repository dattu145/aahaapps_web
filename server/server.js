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
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
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

/* ================================
   Serve React (Vite) build
================================ */
const publicDir = path.join(process.cwd(), 'public');
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
