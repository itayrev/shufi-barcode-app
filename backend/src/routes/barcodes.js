const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const db = require('../models/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'barcode-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all barcodes
router.get('/', async (req, res) => {
  try {
    const barcodes = await db.getAllBarcodes();
    res.json(barcodes);
  } catch (error) {
    console.error('Error fetching barcodes:', error);
    res.status(500).json({ message: 'Failed to fetch barcodes' });
  }
});

// Get single barcode
router.get('/:id', async (req, res) => {
  try {
    const barcode = await db.getBarcodeById(req.params.id);
    if (!barcode) {
      return res.status(404).json({ message: 'Barcode not found' });
    }
    res.json(barcode);
  } catch (error) {
    console.error('Error fetching barcode:', error);
    res.status(500).json({ message: 'Failed to fetch barcode' });
  }
});

// Upload new barcode
router.post('/', upload.single('barcode'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const barcodeId = await db.createBarcode(
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.user.userId
    );

    const newBarcode = await db.getBarcodeById(barcodeId);

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('barcode:created', newBarcode);

    res.status(201).json({
      message: 'Barcode uploaded successfully',
      barcode: newBarcode
    });
  } catch (error) {
    console.error('Error uploading barcode:', error);
    res.status(500).json({ message: 'Failed to upload barcode' });
  }
});

// Update barcode (toggle used status or update amount)
router.put('/:id', [
  body('isUsed').optional().isBoolean(),
  body('amount').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isUsed, amount } = req.body;
    const barcodeId = req.params.id;

    // Check if barcode exists
    const existingBarcode = await db.getBarcodeById(barcodeId);
    if (!existingBarcode) {
      return res.status(404).json({ message: 'Barcode not found' });
    }

    // Update with new values or keep existing ones
    const newIsUsed = isUsed !== undefined ? (isUsed ? 1 : 0) : existingBarcode.is_used;
    const newAmount = amount !== undefined ? amount : existingBarcode.amount;

    const updated = await db.updateBarcode(barcodeId, newIsUsed, newAmount);

    if (!updated) {
      return res.status(404).json({ message: 'Barcode not found or no changes made' });
    }

    const updatedBarcode = await db.getBarcodeById(barcodeId);

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('barcode:updated', updatedBarcode);

    res.json({
      message: 'Barcode updated successfully',
      barcode: updatedBarcode
    });
  } catch (error) {
    console.error('Error updating barcode:', error);
    res.status(500).json({ message: 'Failed to update barcode' });
  }
});

// Delete barcode
router.delete('/:id', async (req, res) => {
  try {
    const barcodeId = req.params.id;

    // Get barcode info before deletion
    const barcode = await db.getBarcodeById(barcodeId);
    if (!barcode) {
      return res.status(404).json({ message: 'Barcode not found' });
    }

    // Delete file from filesystem
    const filePath = barcode.file_path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    const deleted = await db.deleteBarcode(barcodeId);

    if (!deleted) {
      return res.status(404).json({ message: 'Barcode not found' });
    }

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('barcode:deleted', { id: barcodeId });

    res.json({ message: 'Barcode deleted successfully' });
  } catch (error) {
    console.error('Error deleting barcode:', error);
    res.status(500).json({ message: 'Failed to delete barcode' });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ message: error.message });
  }
  next(error);
});

module.exports = router;