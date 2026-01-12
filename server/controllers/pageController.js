const Page = require('../models/Page');

// Get all pages
exports.getAllPages = async (req, res) => {
    try {
        const pages = await Page.findAll();
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single page by ID
exports.getPageById = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single page by Slug
exports.getPageBySlug = async (req, res) => {
    try {
        const page = await Page.findBySlug(req.params.slug);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.json(page);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Page
exports.createPage = async (req, res) => {
    try {
        const { title, slug, content, is_active } = req.body;
        const page = await Page.create({ title, slug, content, is_active });
        res.status(201).json(page);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Page
exports.updatePage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: 'Page not found' });

        const { title, slug, content, is_active } = req.body;
        await Page.update(req.params.id, { title, slug, content, is_active });

        // Return updated page
        const updatedPage = await Page.findById(req.params.id);
        res.json(updatedPage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Page
exports.deletePage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        await Page.delete(req.params.id);
        res.json({ message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
