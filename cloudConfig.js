const cloudinary = require('cloudinary');
const msCloudinary = require('multer-storage-cloudinary');
const CloudinaryStorage = msCloudinary.CloudinaryStorage || msCloudinary;
cloudinary.config({
    cloud_name: process.env.CLOUDE_NAME,
    api_key: process.env.CLOUDE_API_KEY,
    api_secret: process.env.CLOUDE_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Airbnb_Demo',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], 
    
  },
});
module.exports = { cloudinary, storage };