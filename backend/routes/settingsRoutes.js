const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const multer = require('multer');
const path = require('path');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Keep original extension, rename to 'logo' + timestamp to avoid cache issues or collisions
        const ext = path.extname(file.originalname);
        cb(null, 'logo-' + Date.now() + ext);
    }
});
const upload = multer({ storage });

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.post('/logo', upload.single('logo'), settingsController.uploadLogo);
router.get('/logo', settingsController.getLogo);

module.exports = router;
