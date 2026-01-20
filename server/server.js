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

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pages', require('./routes/pageRoutes'));


// Serve static files from client build
// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route to serve React App
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
