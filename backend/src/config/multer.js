import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize S3 client
const s3 = new S3Client({ 
  region: process.env.AWS_REGION || 'us-east-1' 
});

// Use memory storage instead of disk storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Helper function to upload to S3
export const uploadToS3 = async (file, userId, folder = 'profiles') => {
  if (!file) throw new Error('No file provided');
  
  // Generate filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const ext = file.originalname.split('.').pop();
  const filename = `${userId}_${timestamp}_${randomString}.${ext}`;
  const key = `${folder}/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    // NO ACL HERE - bucket policy handles public access
  });
  
  await s3.send(command);
  
  // Return the public URL
  const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
  
  return imageUrl;
};

// Single file upload middleware
export const uploadProfilePicture = upload.single('profilePicture');

// Error handling middleware
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ message: 'File too large. Max size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

export default upload;