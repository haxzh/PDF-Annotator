const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const highlightController = require('../controllers/highlightController');

router.post('/', auth, highlightController.createHighlight);
router.get('/:uuid', auth, highlightController.getHighlights);
router.delete('/:id', auth, highlightController.deleteHighlight);

module.exports = router;