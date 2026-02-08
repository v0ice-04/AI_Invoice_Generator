const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const { parsePrompt } = require('../utils/openaiParser');
const { generateInvoicePDF, saveInvoiceToDisk } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

// Generate Invoice from Prompt
exports.generateInvoice = async (req, res) => {
    try {
        const { prompt, clientAddress, paymentMethod } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        // 1. Parse Prompt with OpenAI
        const extractedData = await parsePrompt(prompt);

        // 2. Fetch Settings for Auto-Increment
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        const nextNum = settings.nextInvoiceNumber;
        const prefix = settings.prefix || 'INV-';

        // Check if nextNum is valid, default to 1 if not
        const safeNextNum = typeof nextNum === 'number' ? nextNum : 1;

        // Pad number with leading zeros (e.g., 001, 002)
        const invoiceNumber = `${prefix}${String(safeNextNum).padStart(3, '0')}`;

        // Increment and save settings immediately to prevent race conditions (simple approach)
        settings.nextInvoiceNumber = safeNextNum + 1;
        await settings.save();

        // 3. Calculate Amounts
        const baseAmount = parseFloat(extractedData.baseAmount);
        const gstPercentage = parseFloat(extractedData.gstPercentage);
        const gstAmount = (baseAmount * gstPercentage) / 100;
        const totalAmount = baseAmount + gstAmount;

        // 4. Create Invoice Object
        // Use data from request body if provided (overriding potential AI extraction or filling gaps)
        const newInvoice = new Invoice({
            invoiceNumber,
            clientName: extractedData.clientName,
            serviceDescription: extractedData.serviceDescription,
            baseAmount,
            gstPercentage,
            gstAmount,
            totalAmount,
            dueDate: extractedData.dueDate ? new Date(extractedData.dueDate) : null,
            // New Fields
            clientAddress: clientAddress || '', // From UI Input
            paymentMethod: paymentMethod || 'Net Banking' // From UI Input
        });

        await newInvoice.save();

        // 5. Save PDF to Disk
        try {
            await saveInvoiceToDisk(newInvoice);
        } catch (pdfError) {
            console.warn("Failed to save PDF to disk (expected on Vercel/Serverless):", pdfError.message);
        }

        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice', details: error.message });
    }
};

// Download PDF
exports.downloadInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
        const filePath = path.join(__dirname, '..', 'invoices', fileName);

        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
            await generateInvoicePDF(invoice, res);
        }
    } catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

// Get All Invoices
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};
