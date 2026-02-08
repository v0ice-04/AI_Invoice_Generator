const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Settings = require('../models/Settings');

const generateInvoicePDF = async (invoice, outputStream) => {
    const settings = await Settings.findOne() || new Settings(); // Default if not found

    const doc = new PDFDocument({ margin: 50 });

    // Pipe the PDF directly to the stream (response or file)
    doc.pipe(outputStream);

    // --- HEADER SECTION ---
    let yPosition = 50;

    // 1. Logo (Top Left)
    // 1. Logo (Top Left)
    if (settings.logoBase64) {
        try {
            const logoBuffer = Buffer.from(settings.logoBase64, 'base64');
            doc.image(logoBuffer, 50, yPosition, { width: 100 });
        } catch (err) {
            console.error("Error embedding base64 logo:", err);
        }
    } else if (settings.logoPath) {
        const logoPath = path.join(__dirname, '..', settings.logoPath);
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, yPosition, { width: 100 }); // Adjust width/height as needed
            // Don't increase yPosition significantly, let text flow to the right if possible, or below
        }
    }

    // 2. Invoice Title & Number (Top Right)
    doc.font('Helvetica-Bold').fontSize(24).text('INVOICE', 400, yPosition, { align: 'right' });
    doc.font('Helvetica').fontSize(10).text(`#${invoice.invoiceNumber}`, 400, yPosition + 30, { align: 'right' });

    // 3. Company Info (Below Title, Right Aligned)
    doc.moveDown();
    const companyInfoTop = yPosition + 50;
    doc.font('Helvetica-Bold').fontSize(10).text(settings.companyName, 300, companyInfoTop, { align: 'right' });
    doc.font('Helvetica').text(settings.companyAddress, 300, companyInfoTop + 15, { align: 'right' });
    if (settings.companyTaxId) {
        doc.text(`Tax ID: ${settings.companyTaxId}`, 300, companyInfoTop + 30, { align: 'right' });
    }

    // --- BILL TO SECTION ---
    const billToTop = companyInfoTop + 60;
    yPosition = billToTop;

    doc.text(`Bill To:`, 50, yPosition, { underline: true });
    doc.font('Helvetica-Bold').text(invoice.clientName, 50, yPosition + 15);
    doc.font('Helvetica').text(invoice.clientAddress || 'Address not provided', 50, yPosition + 30);

    // --- DATES & PAYMENT INFO ---
    // Align with Bill To but on the right
    doc.text(`Date:`, 400, yPosition, { align: 'right' });
    doc.text(new Date(invoice.createdAt).toLocaleDateString(), 400, yPosition + 15, { align: 'right' }); // Corrected date alignment

    doc.text(`Due Date:`, 400, yPosition + 30, { align: 'right' });
    doc.text(invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Immediate', 400, yPosition + 45, { align: 'right' });


    // --- TABLE SECTION ---
    const tableTop = yPosition + 100;

    // Header Row
    doc.font('Helvetica-Bold');
    doc.rect(50, tableTop, 500, 20).fill('#eeeeee').stroke();
    doc.fillColor('black');
    doc.text('Description', 60, tableTop + 5); // Indent slightly
    doc.text('Base Amount', 300, tableTop + 5, { width: 90, align: 'right' });
    doc.text('GST %', 400, tableTop + 5, { width: 50, align: 'right' });
    doc.text('Total', 500, tableTop + 5, { width: 40, align: 'right' }); // Adjusted width

    // Table Content
    let rowTop = tableTop + 25;
    doc.font('Helvetica');

    doc.text(invoice.serviceDescription, 60, rowTop);
    doc.text(invoice.baseAmount.toFixed(2), 300, rowTop, { width: 90, align: 'right' });
    doc.text(`${invoice.gstPercentage}%`, 400, rowTop, { width: 50, align: 'right' });
    doc.text(invoice.totalAmount.toFixed(2), 500, rowTop, { width: 40, align: 'right' });

    // Line below item
    doc.moveTo(50, rowTop + 20).lineTo(550, rowTop + 20).strokeOpacity(0.2).stroke();

    // --- SUMMARY SECTION ---
    const summaryTop = rowTop + 40;

    doc.strokeOpacity(1); // Reset opacity
    doc.text(`Subtotal:`, 350, summaryTop, { align: 'right', width: 100 });
    doc.text(invoice.baseAmount.toFixed(2), 500, summaryTop, { align: 'right', width: 40 });

    doc.text(`GST (${invoice.gstPercentage}%):`, 350, summaryTop + 15, { align: 'right', width: 100 });
    doc.text(invoice.gstAmount.toFixed(2), 500, summaryTop + 15, { align: 'right', width: 40 });

    doc.rect(350, summaryTop + 30, 200, 0.5).stroke(); // Divider

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text(`Grand Total:`, 350, summaryTop + 40, { align: 'right', width: 100 });
    doc.text(invoice.totalAmount.toFixed(2), 500, summaryTop + 40, { align: 'right', width: 40 });

    // --- PAYMENT METHOD & FOOTER ---
    const footerTop = 700;
    doc.fontSize(10).font('Helvetica');

    // Payment Method Box
    doc.rect(50, footerTop - 50, 200, 40).stroke();
    doc.text(`Payment Method:`, 60, footerTop - 40);
    doc.font('Helvetica-Bold').text(invoice.paymentMethod || 'Net Banking', 60, footerTop - 25);

    // Footer Text
    doc.font('Helvetica').fontSize(10);
    doc.text('Thank you for your business!', 50, footerTop + 20, { align: 'center', width: 500 });

    doc.end();
};

const saveInvoiceToDisk = async (invoice) => {
    const fileName = `invoice-${invoice.invoiceNumber}.pdf`;
    // Ensure invoices directory matches the one created earlier (backend/invoices)
    const invoicesDir = path.join(__dirname, '..', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const filePath = path.join(invoicesDir, fileName);
    const writeStream = fs.createWriteStream(filePath);
    await generateInvoicePDF(invoice, writeStream);
    return fileName;
};

module.exports = { generateInvoicePDF, saveInvoiceToDisk };
