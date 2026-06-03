// controllers/user.controller.js
import UserModel from '../models/user.model.js';
import { uploadToS3 } from '../config/multer.js';

class UserController {
  static async updateProfile(req, res) {
    try {
      const { first_name, middle_name, last_name, sex } = req.body;
      
      const updateData = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (middle_name !== undefined) updateData.middle_name = middle_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (sex !== undefined) updateData.sex = sex;
      
      const updatedUser = await UserModel.update(req.userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
  
  // UPDATED: Upload to S3 instead of local disk
  static async uploadProfilePicture(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const userId = req.userId;
      
      // Get current user to check for existing profile picture
      const currentUser = await UserModel.findById(userId);
      
      // Upload to S3 (returns the public URL)
      const imageUrl = await uploadToS3(req.file, userId, 'profiles');
      
      // Update user with new profile picture URL (store the full URL)
      const updatedUser = await UserModel.update(userId, { pfp_path: imageUrl });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Note: Old profile picture deletion from S3 is optional
      // If you want to delete old images from S3 to save space:
      if (currentUser && currentUser.pfp_path && currentUser.pfp_path.includes('amazonaws.com')) {
        // Extract key from URL and delete from S3 (optional, can implement later)
        // For portfolio, you can skip this or implement cleanup later
        console.log('Old profile picture exists in S3:', currentUser.pfp_path);
      }
      
      res.json({
        message: 'Profile picture uploaded successfully',
        pfp_path: imageUrl,  // Now returns full S3/CloudFront URL
        user: updatedUser
      });
    } catch (error) {
      console.error('Upload profile picture error:', error);
      res.status(500).json({ message: 'Failed to upload profile picture: ' + error.message });
    }
  }
  
  // UPDATED: No file deletion needed from S3 for portfolio (or implement later)
  static async deleteProfilePicture(req, res) {
    try {
      const userId = req.userId;
      
      // Get current user
      const currentUser = await UserModel.findById(userId);
      
      if (!currentUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Optional: Delete from S3 if you want to save storage space
      // For portfolio, you can skip S3 deletion to keep it simple
      if (currentUser.pfp_path && currentUser.pfp_path.includes('amazonaws.com')) {
        console.log('Profile picture URL to potentially delete:', currentUser.pfp_path);
        // To implement S3 deletion later:
        // await deleteFromS3(currentUser.pfp_path);
      }
      
      // Update user to remove pfp_path
      const updatedUser = await UserModel.update(userId, { pfp_path: null });
      
      res.json({
        message: 'Profile picture deleted successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Delete profile picture error:', error);
      res.status(500).json({ message: 'Failed to delete profile picture' });
    }
  }
  
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user' });
    }
  }
}

export default UserController;