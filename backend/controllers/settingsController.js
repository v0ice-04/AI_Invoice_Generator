const fs = require('fs');
const path = require('path');
const Settings = require('../models/Settings');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Get or Create Settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        // Normalize logo path for frontend serving if necessary
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// Update Settings (Text Fields)
exports.updateSettings = async (req, res) => {
    try {
        const { companyName, companyAddress, companyTaxId, prefix, nextInvoiceNumber } = req.body;
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();

        if (companyName) settings.companyName = companyName;
        if (companyAddress) settings.companyAddress = companyAddress;
        if (companyTaxId) settings.companyTaxId = companyTaxId;
        if (prefix) settings.prefix = prefix;
        if (nextInvoiceNumber) settings.nextInvoiceNumber = nextInvoiceNumber;

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

// Upload Logo
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();

        // Delete old logo if exists
        if (settings.logoPath) {
            const oldPath = path.join(__dirname, '..', settings.logoPath);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save relative path using forward slashes for cross-platform compatibility
        settings.logoPath = path.relative(path.join(__dirname, '..'), req.file.path).split(path.sep).join('/');
        await settings.save();

        res.json({ logoPath: settings.logoPath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
};

// Serve Logo
exports.getLogo = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings || !settings.logoPath) {
            return res.status(404).send('Logo not found');
        }
        const filePath = path.join(__dirname, '..', settings.logoPath);
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('Logo file missing');
        }
    } catch (error) {
        res.status(500).send('Error serving logo');
    }
};
