const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage for Reels (Videos)
const reelStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mutantmodz/reels',
    resource_type: 'video',
    public_id: (req, file) => `reel-${Date.now()}`
  }
});

// Configure Storage for Hero Slides (Images)
const heroStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mutantmodz/hero',
    resource_type: 'image',
    public_id: (req, file) => `hero-${Date.now()}`
  }
});

// Configure General Storage (Product images, etc.)
const generalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mutantmodz/general',
    resource_type: 'auto',
    public_id: (req, file) => `file-${Date.now()}`
  }
});

module.exports = {
  cloudinary,
  reelStorage,
  heroStorage,
  generalStorage
};
