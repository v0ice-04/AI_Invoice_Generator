const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    clientName: String,
    clientAddress: String, // Added
    serviceDescription: String,
    baseAmount: Number,
    gstPercentage: Number,
    gstAmount: Number,
    totalAmount: Number,
    dueDate: Date,
    paymentMethod: { type: String, enum: ['Cash', 'Net Banking', 'UPI', 'Cheque'], default: 'Net Banking' }, // Added
    createdAt: { type: Date, default: Date.now },
}, { bufferCommands: false });

module.exports = mongoose.model('Invoice', invoiceSchema);
