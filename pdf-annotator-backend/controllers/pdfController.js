const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const PDF = require('../models/PDF');
const Highlight = require('../models/Highlight');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileId = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, fileId + fileExtension);
  },
});
const upload = multer({ storage: storage });
exports.uploadMiddleware = upload.single('pdfFile');

exports.uploadPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }
    const { originalname, filename } = req.file;
    const pdfUuid = filename.split('.')[0];
    const newPdf = new PDF({
      uuid: pdfUuid,
      filename: originalname,
      owner: req.user.id,
    });
    await newPdf.save();
    res.json({ msg: 'PDF uploaded successfully', uuid: pdfUuid });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getPdfs = async (req, res) => {
  try {
    const pdfs = await PDF.find({ owner: req.user.id }).select('uuid filename');
    res.json(pdfs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getPdfByUuid = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ uuid: req.params.uuid, owner: req.user.id });
    if (!pdf) {
      return res.status(404).json({ msg: 'PDF not found or you do not have access' });
    }
    const fileExtension = path.extname(pdf.filename);
    const filePath = path.join(__dirname, '..', 'uploads', `${pdf.uuid}${fileExtension}`);

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(404).end();
        }
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.deletePdf = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ uuid: req.params.uuid, owner: req.user.id });
    if (!pdf) {
      return res.status(404).json({ msg: 'PDF not found' });
    }
    const fileExtension = path.extname(pdf.filename);
    const filePath = path.join(__dirname, '..', 'uploads', `${pdf.uuid}${fileExtension}`);

    fs.unlink(filePath, async (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
        return res.status(500).send('Server Error');
      }

      await Highlight.deleteMany({ pdf: pdf._id });
      await pdf.deleteOne();
      res.json({ msg: 'PDF and highlights deleted successfully' });
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.renamePdf = async (req, res) => {
  try {
    const { newFilename } = req.body;
    const pdf = await PDF.findOne({ uuid: req.params.uuid, owner: req.user.id });
    if (!pdf) {
      return res.status(404).json({ msg: 'PDF not found' });
    }
    pdf.filename = newFilename;
    await pdf.save();
    res.json({ msg: 'PDF renamed successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};