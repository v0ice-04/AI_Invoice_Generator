const fs = require('fs');
const path = require('path');
const Settings = require('../models/Settings');

// Get or Create Settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
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

// Upload Logo (Base64 for Serverless)
exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();

        // Convert buffer to base64
        const fileBase64 = req.file.buffer.toString('base64');
        const fileMimeType = req.file.mimetype;

        settings.logoBase64 = fileBase64;
        settings.logoMimeType = fileMimeType;
        settings.logoPath = ''; // clear legacy path

        await settings.save();

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
};

// Serve Logo from DB
exports.getLogo = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        // Fallback or check legacy path if needed (skipping legacy path for now as Vercel effectively deleted it)
        if (!settings || !settings.logoBase64) {
            return res.status(404).send('Logo not found');
        }

        const imgBuffer = Buffer.from(settings.logoBase64, 'base64');
        res.setHeader('Content-Type', settings.logoMimeType || 'image/png');
        res.send(imgBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error serving logo');
    }
};
