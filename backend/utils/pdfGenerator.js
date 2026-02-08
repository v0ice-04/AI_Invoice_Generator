const PDFDocument = require('pdfkit');
const Settings = require('../models/Settings');
const supabase = require('./supabase');

const populateInvoicePDF = async (doc, invoice) => {
    const settings = await Settings.findOne() || new Settings();
    let yPosition = 50;

    // 1. Logo (Fetched from Supabase if exists)
    if (settings.logoPath) {
        try {
            const { data, error } = await supabase.storage.from('invoice-assets').download(settings.logoPath);
            if (data && !error) {
                const buffer = Buffer.from(await data.arrayBuffer());
                doc.image(buffer, 50, yPosition, { width: 100 });
            }
        } catch (e) { console.error("Logo load error", e); }
    }

    doc.font('Helvetica-Bold').fontSize(24).text('INVOICE', 400, yPosition, { align: 'right' });
    doc.font('Helvetica').fontSize(10).text(`#${invoice.invoiceNumber}`, 400, yPosition + 30, { align: 'right' });

    doc.moveDown();
    const companyInfoTop = yPosition + 50;
    doc.font('Helvetica-Bold').fontSize(10).text(settings.companyName || 'Company Name', 300, companyInfoTop, { align: 'right' });
    doc.font('Helvetica').text(settings.companyAddress || 'Company Address', 300, companyInfoTop + 15, { align: 'right' });
    if (settings.companyTaxId) {
        doc.text(`Tax ID: ${settings.companyTaxId}`, 300, companyInfoTop + 30, { align: 'right' });
    }

    const billToTop = companyInfoTop + 60;
    yPosition = billToTop;

    doc.text(`Bill To:`, 50, yPosition, { underline: true });
    doc.font('Helvetica-Bold').text(invoice.clientName, 50, yPosition + 15);
    doc.font('Helvetica').text(invoice.clientAddress || 'Address not provided', 50, yPosition + 30);

    doc.text(`Date:`, 400, yPosition, { align: 'right' });
    doc.text(new Date(invoice.createdAt).toLocaleDateString(), 400, yPosition + 15, { align: 'right' });

    doc.text(`Due Date:`, 400, yPosition + 30, { align: 'right' });
    doc.text(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Immediate', 400, yPosition + 45, { align: 'right' });

    const tableTop = yPosition + 100;
    doc.font('Helvetica-Bold');
    doc.rect(50, tableTop, 500, 20).fill('#eeeeee').stroke();
    doc.fillColor('black');
    doc.text('Description', 60, tableTop + 5);
    doc.text('Base Amount', 300, tableTop + 5, { width: 90, align: 'right' });
    doc.text('GST %', 400, tableTop + 5, { width: 50, align: 'right' });
    doc.text('Total', 500, tableTop + 5, { width: 40, align: 'right' });

    let rowTop = tableTop + 25;
    doc.font('Helvetica');
    doc.text(invoice.serviceDescription, 60, rowTop);
    doc.text(invoice.baseAmount.toFixed(2), 300, rowTop, { width: 90, align: 'right' });
    doc.text(`${invoice.gstPercentage}%`, 400, rowTop, { width: 50, align: 'right' });
    doc.text(invoice.totalAmount.toFixed(2), 500, rowTop, { width: 40, align: 'right' });

    doc.moveTo(50, rowTop + 20).lineTo(550, rowTop + 20).strokeOpacity(0.2).stroke();

    const summaryTop = rowTop + 40;
    doc.strokeOpacity(1);
    doc.text(`Subtotal:`, 350, summaryTop, { align: 'right', width: 100 });
    doc.text(invoice.baseAmount.toFixed(2), 500, summaryTop, { align: 'right', width: 40 });
    doc.text(`GST (${invoice.gstPercentage}%):`, 350, summaryTop + 15, { align: 'right', width: 100 });
    doc.text(invoice.gstAmount.toFixed(2), 500, summaryTop + 15, { align: 'right', width: 40 });
    doc.rect(350, summaryTop + 30, 200, 0.5).stroke();
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Grand Total:`, 350, summaryTop + 40, { align: 'right', width: 100 });
    doc.text(invoice.totalAmount.toFixed(2), 500, summaryTop + 40, { align: 'right', width: 40 });

    const footerTop = 700;
    doc.fontSize(10).font('Helvetica');
    doc.rect(50, footerTop - 50, 200, 40).stroke();
    doc.text(`Payment Method:`, 60, footerTop - 40);
    doc.font('Helvetica-Bold').text(invoice.paymentMethod || 'Net Banking', 60, footerTop - 25);
    doc.text('Thank you for your business!', 50, footerTop + 20, { align: 'center', width: 500 });
};

const generateInvoicePDF = async (invoice, outputStream) => {
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(outputStream);
    await populateInvoicePDF(doc, invoice);
    doc.end();
};

const saveInvoiceToSupabase = async (invoice) => {
    return new Promise(async (resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', async () => {
            try {
                const pdfBuffer = Buffer.concat(buffers);
                const fileName = `invoices/invoice-${invoice.invoiceNumber}.pdf`;

                const { data, error } = await supabase.storage
                    .from('invoice-assets')
                    .upload(fileName, pdfBuffer, {
                        contentType: 'application/pdf',
                        upsert: true
                    });

                if (error) reject(error);
                else resolve(fileName);
            } catch (err) {
                reject(err);
            }
        });

        try {
            await populateInvoicePDF(doc, invoice);
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateInvoicePDF, saveInvoiceToSupabase };
