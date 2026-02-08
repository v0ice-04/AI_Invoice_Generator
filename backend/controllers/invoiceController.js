const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');
const { parsePrompt } = require('../utils/openaiParser');
const { generateInvoicePDF, saveInvoiceToSupabase } = require('../utils/pdfGenerator');
const supabase = require('../utils/supabase');

exports.generateInvoice = async (req, res) => {
    try {
        const { prompt, clientAddress, paymentMethod } = req.body;
        if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

        const extractedData = await parsePrompt(prompt);

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        const safeNextNum = typeof settings.nextInvoiceNumber === 'number' ? settings.nextInvoiceNumber : 1;
        const prefix = settings.prefix || 'INV-';
        const invoiceNumber = `${prefix}${String(safeNextNum).padStart(3, '0')}`;

        settings.nextInvoiceNumber = safeNextNum + 1;
        await settings.save();

        const baseAmount = parseFloat(extractedData.baseAmount);
        const gstPercentage = parseFloat(extractedData.gstPercentage);
        const gstAmount = (baseAmount * gstPercentage) / 100;
        const totalAmount = baseAmount + gstAmount;

        const newInvoice = new Invoice({
            invoiceNumber,
            clientName: extractedData.clientName,
            serviceDescription: extractedData.serviceDescription,
            baseAmount,
            gstPercentage,
            gstAmount,
            totalAmount,
            dueDate: extractedData.dueDate ? new Date(extractedData.dueDate) : null,
            clientAddress: clientAddress || '',
            paymentMethod: paymentMethod || 'Net Banking'
        });

        await newInvoice.save();

        // 5. Save PDF to Supabase
        try {
            await saveInvoiceToSupabase(newInvoice);
        } catch (storageError) {
            console.error("Supabase Storage Error:", storageError);
        }

        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ error: 'Failed to generate invoice' });
    }
};

exports.downloadInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

        const fileName = `invoices/invoice-${invoice.invoiceNumber}.pdf`;

        const { data, error } = await supabase.storage
            .from('invoice-assets')
            .createSignedUrl(fileName, 60);

        if (error || !data) {
            // Fallback: Generate it on the fly if storage fetch fails
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);
            await generateInvoicePDF(invoice, res);
        } else {
            res.redirect(data.signedUrl);
        }
    } catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};
