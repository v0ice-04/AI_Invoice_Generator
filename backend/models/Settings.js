const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    companyName: { type: String, default: 'My Company Name' },
    companyAddress: { type: String, default: '123 Business St, Tech City' },
    companyTaxId: { type: String, default: '' },
    logoPath: { type: String, default: '' }, // Deprecated for Vercel, kept for backward compat
    logoBase64: { type: String, default: '' },
    logoMimeType: { type: String, default: '' },
    nextInvoiceNumber: { type: Number, default: 1 }, // For auto-increment
    prefix: { type: String, default: 'INV-' }
}, { bufferCommands: false });

module.exports = mongoose.model('Settings', settingsSchema);
