'use strict'

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${unique}${ext}`);
  }
});

function fileFilter(req, file, cb) {
  const permitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (permitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'), false);
  }
}

const limites = { fileSize: 5 * 1024 * 1024 }; // 5 MB

const uploadPortada   = multer({ storage, fileFilter, limits: limites }).single('portada');
const uploadImagenes  = multer({ storage, fileFilter, limits: limites }).array('imagenes', 5);
const uploadMenu      = multer({ storage, fileFilter, limits: limites }).single('imagenMenu');

module.exports = { uploadPortada, uploadImagenes, uploadMenu };
