const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nexcura_meals',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

// Configuration du middleware multer pour l'upload
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };