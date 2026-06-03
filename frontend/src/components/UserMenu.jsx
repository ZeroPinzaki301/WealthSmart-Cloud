import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserMenu({ profilePicture }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await logout();
      setIsOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return '?';
    
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return 'User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    if (user.username) {
      return user.username;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // Get user email
  const getUserEmail = () => {
    return user?.email || 'user@example.com';
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-2 p-2 rounded-lg hover:bg-background-hover transition-colors"
        aria-label="User menu"
        disabled={isLoading}
      >
        {profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-primary"
            onError={(e) => {
              console.error('UserMenu image failed to load:', profilePicture);
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex';
              }
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center text-white font-semibold text-sm">
            {getUserInitials()}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}
          
          {/* Dropdown Menu - Responsive positioning */}
          <div className={`
            ${isMobile 
              ? 'fixed bottom-20 left-4 right-4 z-50' 
              : 'absolute right-0 mt-2'
            }
            bg-background-subtle border border-border rounded-lg shadow-lg overflow-hidden
          `}>
            <div className="px-4 py-3 border-b border-border flex items-center gap-3">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                  onError={(e) => {
                    console.error('UserMenu dropdown image failed to load:', profilePicture);
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-darkest flex items-center justify-center text-white font-semibold text-base">
                  {getUserInitials()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-text font-medium truncate">{getDisplayName()}</p>
                <p className="text-text-muted text-sm truncate">{getUserEmail()}</p>
              </div>
            </div>
            <div className="py-2">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/profile');
                }}
                className="w-full px-4 py-2 text-left text-text hover:bg-background-hover transition-colors"
              >
                My Profile
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-2 text-left text-text hover:bg-background-hover transition-colors"
              >
                Account Settings
              </button>
              <hr className="my-1 border-border" />
              <button 
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-background-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    Signing out...
                  </>
                ) : (
                  'Sign Out'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}