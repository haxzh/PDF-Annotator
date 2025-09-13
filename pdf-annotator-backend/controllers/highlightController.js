const Highlight = require('../models/Highlight');
const PDF = require('../models/PDF');

exports.createHighlight = async (req, res) => {
  const { pdfUuid, pageNumber, text, position } = req.body;
  try {
    const pdf = await PDF.findOne({ uuid: pdfUuid, owner: req.user.id });
    if (!pdf) {
      return res.status(404).json({ msg: 'PDF not found or you do not have access' });
    }
    const newHighlight = new Highlight({
      pdf: pdf._id,
      pageNumber,
      text,
      position,
    });
    await newHighlight.save();
    res.json(newHighlight);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getHighlights = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ uuid: req.params.uuid, owner: req.user.id });
    if (!pdf) {
      return res.status(404).json({ msg: 'PDF not found or you do not have access' });
    }
    const highlights = await Highlight.find({ pdf: pdf._id });
    res.json(highlights);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findById(req.params.id);
    if (!highlight) {
      return res.status(404).json({ msg: 'Highlight not found' });
    }
    const pdf = await PDF.findById(highlight.pdf);
    if (!pdf || pdf.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized to delete this highlight' });
    }
    await highlight.deleteOne();
    res.json({ msg: 'Highlight removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};