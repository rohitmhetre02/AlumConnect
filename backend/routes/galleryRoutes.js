const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Gallery = require('../models/Gallery');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to check department access
const canAccessDepartment = (user, department) => {
  if (user.role === 'admin') return true; // Super Admin can access all
  if (user.role === 'coordinator' && user.department === department) return true;
  return false;
};

// Helper function to get available departments for user
const getAvailableDepartments = (user) => {
  if (user.role === 'admin') {
    return [
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design & Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ];
  }
  if (user.role === 'coordinator' && user.department) {
    return [user.department];
  }
  return [];
};

// GET /api/gallery - Root endpoint (return departments)
router.get('/', async (req, res) => {
  try {
    const departments = [
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design & Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ];

    const departmentCounts = await Promise.all(
      departments.map(async (dept) => {
        const count = await Gallery.countDocuments({ department: dept });
        return { department: dept, imageCount: count };
      })
    );

    res.json({
      success: true,
      departments: departmentCounts
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    });
  }
});

// GET /api/gallery/departments - Get all departments (for user view)
router.get('/departments', async (req, res) => {
  try {
    const departments = [
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design & Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ];

    // Get image counts for each department
    const departmentCounts = await Promise.all(
      departments.map(async (dept) => {
        const count = await Gallery.countDocuments({ department: dept });
        return { department: dept, imageCount: count };
      })
    );

    res.json({
      success: true,
      departments: departmentCounts
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    });
  }
});

// GET /api/gallery/:department/folders - Get folders for a department
router.get('/:department/folders', async (req, res) => {
  try {
    const { department } = req.params;
    
    // Validate department
    const validDepartments = [
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design & Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ];

    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid department'
      });
    }

    const folders = ['Events', 'Campus', 'Traditional Day', 'Alumni Meet', 'Industrial Visit'];

    // Get image counts for each folder
    const folderCounts = await Promise.all(
      folders.map(async (folder) => {
        const count = await Gallery.countDocuments({ department, folder });
        return { folder, imageCount: count };
      })
    );

    res.json({
      success: true,
      department,
      folders: folderCounts
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch folders'
    });
  }
});

// GET /api/gallery/:department/:folder/images - Get images for a specific folder
router.get('/:department/:folder/images', async (req, res) => {
  try {
    const { department, folder } = req.params;
    
    // Validate department and folder
    const validDepartments = [
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design & Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ];

    const validFolders = ['Events', 'Campus', 'Traditional Day', 'Alumni Meet', 'Industrial Visit'];

    if (!validDepartments.includes(department) || !validFolders.includes(folder)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid department or folder'
      });
    }

    const images = await Gallery.find({ department, folder })
      .sort({ createdAt: -1 })
      .select('imageName imageUrl uploadedByName createdAt');

    res.json({
      success: true,
      department,
      folder,
      images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch images'
    });
  }
});

// POST /api/gallery/test-upload - Simple test upload (Admin/Coordinator only)
router.post('/test-upload', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    console.log('=== TEST UPLOAD REQUEST ===');
    console.log('User:', req.user);
    console.log('Files count:', req.files ? req.files.length : 0);
    console.log('Body:', req.body);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'No user found' });
    }

    if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files' });
    }

    // Just return file info without uploading to Cloudinary
    const fileInfo = req.files.map(file => ({
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({ 
      success: true, 
      message: 'Test upload successful',
      files: fileInfo,
      user: {
        id: req.user.id,
        role: req.user.role,
        name: req.user.name || 'Admin'
      }
    });

  } catch (error) {
    console.error('TEST UPLOAD ERROR:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// POST /api/gallery/upload - Upload images (Admin/Coordinator only)
router.post('/upload', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    console.log('=== Gallery Upload Request Started ===');
    console.log('User:', req.user);
    console.log('Files:', req.files ? req.files.length : 'No files');
    console.log('Body:', req.body);

    // Check if user has upload permissions
    if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
      console.log('Permission denied for role:', req.user.role);
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only admins and coordinators can upload images.'
      });
    }

    const { department, folder } = req.body;

    console.log('Department:', department);
    console.log('Folder:', folder);

    // Validate department and folder
    const validDepartments = [
      'Civil Engineering',
      'Computer Engineering',
      'Information Technology',
      'Electronics & Telecommunication Engineering',
      'Mechanical Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics Engineering (VLSI Design & Technology)',
      'Electronics & Communication (Advanced Communication Technology)'
    ];

    const validFolders = ['Events', 'Campus', 'Traditional Day', 'Alumni Meet', 'Industrial Visit'];

    if (!validDepartments.includes(department) || !validFolders.includes(folder)) {
      console.log('Invalid department or folder');
      return res.status(400).json({
        success: false,
        error: 'Invalid department or folder'
      });
    }

    // Check department access for coordinators
    if (!canAccessDepartment(req.user, department)) {
      console.log('Department access denied for coordinator');
      return res.status(403).json({
        success: false,
        error: 'You can only upload images to your assigned department'
      });
    }

    if (!req.files || req.files.length === 0) {
      console.log('No files provided');
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    const uploadedImages = [];

    // Upload each image to Cloudinary
    for (const file of req.files) {
      try {
        console.log('Uploading file:', file.originalname);
        
        const result = await cloudinary.uploader.upload(file.buffer, {
          folder: `gallery/${department.replace(/\s+/g, '_')}/${folder}`,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto'
        });

        console.log('Cloudinary upload successful:', result.secure_url);

        const galleryImage = new Gallery({
          department,
          folder,
          imageName: file.originalname,
          imageUrl: result.secure_url,
          uploadedBy: req.user.id,
          uploadedByRole: req.user.role,
          uploadedByName: req.user.name || 
                          (req.user.firstName && req.user.lastName ? req.user.firstName + ' ' + req.user.lastName : '') ||
                          'Admin User'
        });

        await galleryImage.save();
        uploadedImages.push(galleryImage);
        console.log('Gallery image saved successfully');
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue with other files even if one fails
      }
    }

    if (uploadedImages.length === 0) {
      console.log('No images uploaded successfully');
      return res.status(500).json({
        success: false,
        error: 'Failed to upload any images'
      });
    }

    console.log(`✅ Successfully uploaded ${uploadedImages.length} images`);
    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images: ' + error.message
    });
  }
});

// GET /api/gallery/upload/departments - Get available departments for upload (Admin/Coordinator only)
router.get('/upload/departments', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const departments = getAvailableDepartments(req.user);
    res.json({
      success: true,
      departments
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch departments'
    });
  }
});

// DELETE /api/gallery/:imageId - Delete an image (Admin/Coordinator only)
router.delete('/:imageId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only admins and coordinators can delete images.'
      });
    }

    const image = await Gallery.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Check department access for coordinators
    if (!canAccessDepartment(req.user, image.department)) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete images from your assigned department'
      });
    }

    // Delete from Cloudinary
    try {
      const publicId = image.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
    }

    // Delete from database
    await Gallery.findByIdAndDelete(req.params.imageId);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

module.exports = router;
