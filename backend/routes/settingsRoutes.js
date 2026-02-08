const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const multer = require('multer');

// Use Memory Storage for multer when uploading to Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/logo', upload.single('logo'), settingsController.uploadLogo);
router.get('/logo', settingsController.getLogo);

module.exports = router;
