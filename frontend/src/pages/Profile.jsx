import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { 
  TbUser, TbMail, TbCalendar, TbGenderTransgender, TbEdit, 
  TbLogout, TbArrowLeft, TbCheck, TbX, TbCamera, TbUserCircle,
  TbCalendarTime, TbId, TbLogin, TbUserPlus, TbUpload, TbTrash, TbDeviceFloppy
} from "react-icons/tb";
import { useAuth } from "../context/AuthContext";
import WealthSmartBG from '../assets/WealthSmartBG.png';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    sex: ""
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/me");
      const userData = response.data.user;
      setProfile(userData);
      setEditForm({
        first_name: userData.first_name || "",
        middle_name: userData.middle_name || "",
        last_name: userData.last_name || "",
        sex: userData.sex || ""
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      if (err.response?.status === 401) {
        setShowAuthModal(true);
      } else {
        setError("Failed to load profile data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await axiosInstance.put("/users/profile", editForm);
      if (response.data.message) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        await fetchProfile(); // Refresh profile data
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('profilePicture', selectedFile);
    
    setUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await axiosInstance.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Profile picture updated successfully!');
      await fetchProfile();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error uploading picture:', err);
      setError(err.response?.data?.message || 'Failed to upload picture');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePicture = async () => {
    if (!window.confirm('Are you sure you want to delete your profile picture?')) return;
    
    setUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axiosInstance.delete('/users/profile/picture');
      setSuccess('Profile picture deleted successfully!');
      await fetchProfile();
    } catch (err) {
      console.error('Error deleting picture:', err);
      setError(err.response?.data?.message || 'Failed to delete picture');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthdate) => {
    if (!birthdate) return 'N/A';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // FIXED: This function now handles both local paths and full URLs
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL (starts with http:// or https://), return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Otherwise, assume it's a local path and add the API base URL
    const baseUrl = import.meta.env.VITE_BACKEND_URL_LAMBDA || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  };

  const AuthModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-darkest border border-border rounded-xl max-w-md w-full p-8 text-center transform transition-all">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <TbLogin className="text-4xl text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Authentication Required</h2>
        <p className="text-text mb-6">
          You need to be logged in to view your profile.
        </p>
        <p className="text-sm text-text mb-6">
          Redirecting to login page in <span className="text-primary font-bold">{redirectCountdown}</span> seconds...
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <TbLogin className="text-lg" />
            Login Now
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex-1 bg-background-subtle text-text border border-border px-4 py-2 rounded-lg hover:bg-background transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <TbUserPlus className="text-lg" />
            Create Account
          </button>
        </div>
      </div>
    </div>
  );

  if (showAuthModal) {
    return <AuthModal />;
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-text">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4">
            Failed to load profile data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div 
        className="absolute fixed inset-0 bg-secondary z-0"
        style={{
          maskImage: `url(${WealthSmartBG})`,
          maskSize: 'cover',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          height: '100vh',
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
            >
              <TbArrowLeft className="text-2xl" />
            </button>
            <h1 className="text-3xl font-bold text-primary">My Profile</h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-secondary border border-secondary/30 rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <TbLogout className="text-lg" />
            Logout
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 rounded-lg p-4 mb-6 flex items-center gap-2">
            <TbCheck className="text-lg" />
            <p className="flex-1">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-secondary-darkest/90 backdrop-blur-[3px] border border-border rounded-xl overflow-hidden">
          {/* Cover/Banner Section */}
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative"></div>
          
          {/* Avatar Section */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 mb-6">
              <div className="relative group">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-secondary-darkest shadow-xl"
                  />
                ) : profile.pfp_path ? (
                  <img 
                    src={getImageUrl(profile.pfp_path)} 
                    alt="Profile" 
                    className="w-28 h-28 rounded-full object-cover border-4 border-secondary-darkest shadow-xl"
                    onError={(e) => {
                      console.error('Image failed to load:', profile.pfp_path);
                      e.target.style.display = 'none';
                      // Show fallback avatar
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center border-4 border-secondary-darkest shadow-xl">
                    <TbUserCircle className="text-5xl text-white" />
                  </div>
                )}
                {/* Fallback avatar (hidden by default, shows if image fails) */}
                {profile.pfp_path && (
                  <div 
                    className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center border-4 border-secondary-darkest shadow-xl absolute top-0 left-0 hidden"
                    style={{ display: 'none' }}
                  >
                    <TbUserCircle className="text-5xl text-white" />
                  </div>
                )}
                
                <label className="absolute bottom-1 right-1 p-1.5 bg-primary rounded-full text-white hover:bg-primary-darkest transition-colors cursor-pointer shadow-lg">
                  <TbCamera className="text-sm" />
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/webp,image/gif" 
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
              
              {selectedFile && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleUploadPicture}
                    disabled={uploading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <TbUpload className="text-sm" />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-1.5 bg-background-subtle text-text border border-border rounded-lg hover:bg-background transition-colors cursor-pointer"
                  >
                    <TbX className="text-lg" />
                  </button>
                </div>
              )}
              
              {profile.pfp_path && !selectedFile && (
                <button
                  onClick={handleDeletePicture}
                  disabled={uploading}
                  className="self-start mt-2 p-1.5 bg-red-500/10 text-secondary rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
                  title="Delete profile picture"
                >
                  <TbTrash className="text-lg" />
                </button>
              )}
              
              <div className="flex-1 pt-4 md:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary">
                      {profile.first_name} {profile.middle_name ? profile.middle_name + ' ' : ''}{profile.last_name}
                    </h2>
                    <p className="text-text-muted">@{profile.username}</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        profile.is_verified 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {profile.is_verified ? '✓ Verified Account' : '⚠ Unverified'}
                      </span>
                    </div>
                  </div>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer"
                    >
                      <TbEdit className="text-lg" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-background-subtle text-text border border-border rounded-lg hover:bg-background transition-colors cursor-pointer"
                      >
                        <TbX className="text-lg" />
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <TbDeviceFloppy className="text-lg" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-text mb-2">
                    <TbUser className="text-lg" />
                    <span className="text-sm font-medium">Full Name</span>
                  </div>
                  {!isEditing ? (
                    <p className="text-text text-lg">
                      {profile.first_name} {profile.middle_name ? profile.middle_name + ' ' : ''}{profile.last_name}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="first_name"
                        value={editForm.first_name}
                        onChange={handleEditChange}
                        placeholder="First Name"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                      />
                      <input
                        type="text"
                        name="middle_name"
                        value={editForm.middle_name}
                        onChange={handleEditChange}
                        placeholder="Middle Name (Optional)"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                      />
                      <input
                        type="text"
                        name="last_name"
                        value={editForm.last_name}
                        onChange={handleEditChange}
                        placeholder="Last Name"
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-text mb-2">
                    <TbGenderTransgender className="text-lg" />
                    <span className="text-sm font-medium">Gender</span>
                  </div>
                  {!isEditing ? (
                    <p className="text-text capitalize">{profile.sex || 'Not specified'}</p>
                  ) : (
                    <select
                      name="sex"
                      value={editForm.sex}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-text mb-2">
                    <TbMail className="text-lg" />
                    <span className="text-sm font-medium">Email Address</span>
                  </div>
                  <p className="text-text">{profile.email}</p>
                  {!profile.is_verified && (
                    <button className="mt-2 text-xs text-primary hover:underline cursor-pointer">
                      Resend Verification Email
                    </button>
                  )}
                </div>

                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-2 text-text mb-2">
                    <TbCalendar className="text-lg" />
                    <span className="text-sm font-medium">Birthdate</span>
                  </div>
                  <p className="text-text">{formatDate(profile.birthdate)}</p>
                  <p className="text-text text-sm mt-1">
                    Age: {calculateAge(profile.birthdate)} years old
                  </p>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-primary mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 text-text">
                    <TbId className="text-lg" />
                    <span className="text-sm">User ID</span>
                  </div>
                  <span className="text-text text-sm font-mono">{profile.id}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 text-text">
                    <TbUser className="text-lg" />
                    <span className="text-sm">Username</span>
                  </div>
                  <span className="text-text">@{profile.username}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg">
                  <div className="flex items-center gap-2 text-text">
                    <TbCalendarTime className="text-lg" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <span className="text-text">{formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => navigate("/transactions")}
                  className="p-3 bg-background/50 rounded-lg border border-border hover:bg-background transition-all cursor-pointer text-center"
                >
                  <p className="text-text font-medium">View Transactions</p>
                  <p className="text-text-muted text-sm">See all your transactions</p>
                </button>
                <button
                  onClick={() => navigate("/budget-estimates")}
                  className="p-3 bg-background/50 rounded-lg border border-border hover:bg-background transition-all cursor-pointer text-center"
                >
                  <p className="text-text font-medium">Budget Estimates</p>
                  <p className="text-text-muted text-sm">Manage your budget plans</p>
                </button>
                <button
                  onClick={() => navigate("/transactions/new")}
                  className="p-3 bg-primary/10 rounded-lg border border-primary/30 hover:bg-primary/20 transition-all cursor-pointer text-center"
                >
                  <p className="text-primary font-medium">Add Transaction</p>
                  <p className="text-text-muted text-sm">Record new expense/income</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}