const Settings = require('../models/Settings');
const supabase = require('../utils/supabase');

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

exports.uploadLogo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const fileName = `logos/logo-${Date.now()}${require('path').extname(req.file.originalname)}`;

        const { data, error } = await supabase.storage
            .from('invoice-assets')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) throw error;

        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();
        settings.logoPath = fileName;
        await settings.save();

        res.json({ logoPath: fileName });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload logo to Supabase' });
    }
};

exports.getLogo = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings || !settings.logoPath) return res.status(404).send('Logo not found');

        const { data, error } = await supabase.storage
            .from('invoice-assets')
            .createSignedUrl(settings.logoPath, 60);

        if (error) throw error;
        res.redirect(data.signedUrl);
    } catch (error) {
        res.status(500).send('Error fetching logo');
    }
};
