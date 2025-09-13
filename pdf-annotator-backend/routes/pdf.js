const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const pdfController = require('../controllers/pdfController');

router.post('/upload', auth, pdfController.uploadMiddleware, pdfController.uploadPdf);
router.get('/', auth, pdfController.getPdfs);
router.get('/:uuid', auth, pdfController.getPdfByUuid);
router.delete('/:uuid', auth, pdfController.deletePdf);
router.put('/rename/:uuid', auth, pdfController.renamePdf);

module.exports = router;