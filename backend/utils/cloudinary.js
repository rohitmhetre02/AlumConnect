const cloudinary = require('cloudinary').v2;

/**
 * Read from environment variables ONLY
 * (Never hardcode secrets in source code)
 */
const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_PROFILE_UPLOAD_PRESET,
  CLOUDINARY_COVER_UPLOAD_PRESET,
} = process.env;

/**
 * Configure Cloudinary
 */
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Check if Cloudinary is properly configured
 */
const isCloudinaryConfigured = () =>
  Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);

/**
 * Decide upload preset based on image type
 */
const getPresetForType = (type) => {
  switch (type) {
    case 'avatar':
      return CLOUDINARY_PROFILE_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET;

    case 'cover':
      return CLOUDINARY_COVER_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET;

    default:
      return CLOUDINARY_UPLOAD_PRESET;
  }
};

/**
 * Upload image buffer (server-side upload)
 */
const uploadBuffer = (buffer, { folder } = {}) =>
  new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary is not configured on the server.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });

/**
 * Generate signature for signed uploads (frontend → Cloudinary)
 */
const generateUploadSignature = ({ folder, uploadPreset, publicId } = {}) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured on the server.');
  }

  const timestamp = Math.round(Date.now() / 1000);

  const paramsToSign = {
    timestamp,
    ...(folder && { folder }),
    ...(uploadPreset && { upload_preset: uploadPreset }),
    ...(publicId && { public_id: publicId }),
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    paramsToSign,
  };
};

module.exports = {
  cloudinary,
  uploadBuffer,
  isCloudinaryConfigured,
  generateUploadSignature,
  getPresetForType,

  // safe to export
  CLOUDINARY_CLOUD_NAME,
};
