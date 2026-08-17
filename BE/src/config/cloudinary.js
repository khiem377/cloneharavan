const cloudinary  = require('cloudinary').v2;
const streamifier = require('streamifier');

/**
 * Build folder path: {YYYY}/{MM}/{type}
 * Ví dụ: 2026/08/banners
 */
const buildFolder = (type = 'general') => {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}/${type}`;
};

const configure = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Upload buffer lên Cloudinary
 * @param {Buffer} buffer
 * @param {string} folderPath - đường dẫn folder đầy đủ, ví dụ: "banners/2026-08"
 * @returns {Promise<object>} cloudinary result
 */
const uploadToCloudinary = (buffer, folderPath) => {
  configure();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: folderPath, resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const deleteFromCloudinary = (publicId) => {
  configure();
  return cloudinary.uploader.destroy(publicId);
};

/**
 * List files trong 1 folder trên Cloudinary
 * @param {string} folder - ví dụ "2026/08/banners"
 */
const listCloudinaryFolder = (folder) => {
  configure();
  return cloudinary.api.resources({
    type:        'upload',
    prefix:      folder,
    max_results: 100,
  });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, buildFolder, listCloudinaryFolder };
