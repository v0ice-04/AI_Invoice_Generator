const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/generate', invoiceController.generateInvoice);
router.get('/', invoiceController.getAllInvoices); // New endpoint for list
router.get('/:id/download', invoiceController.downloadInvoicePDF);

module.exports = router;
