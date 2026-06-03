import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SettingsDropdown from './SettingsDropdown';
import UserMenu from './UserMenu';
import FinaSmartIcon from '../assets/WealthSmartIcon.png';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../utils/axiosInstance';

import { MdDashboardCustomize } from "react-icons/md";
import { HiMiniHomeModern } from "react-icons/hi2";
import { TbFileAnalyticsFilled } from "react-icons/tb";
import { MdAddChart } from "react-icons/md";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { TbUserCircle } from "react-icons/tb";

export default function Navbar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const [profilePicture, setProfilePicture] = useState(null);

  // Fetch user profile picture when user is logged in
  useEffect(() => {
    if (user) {
      fetchProfilePicture();
    }
  }, [user]);

  const fetchProfilePicture = async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      const userData = response.data.user;
      console.log('Full user data:', userData);
      console.log('pfp_path value:', userData.pfp_path);
      
      if (userData.pfp_path) {
        // Check if it's already a full URL
        if (userData.pfp_path.startsWith('http://') || userData.pfp_path.startsWith('https://')) {
          setProfilePicture(userData.pfp_path);
        } else {
          // Local path - add base URL
          const baseUrl = import.meta.env.VITE_BACKEND_URL_LAMBDA || import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
          setProfilePicture(`${baseUrl}${userData.pfp_path}`);
        }
        console.log('Setting profile picture to:', userData.pfp_path);
      } else {
        setProfilePicture(null);
        console.log('No profile picture path found');
      }
    } catch (err) {
      console.error("Error fetching profile picture:", err);
      setProfilePicture(null);
    }
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <HiMiniHomeModern className='text-[1em]'/> },
    { path: '/dashboard', label: 'Dashboard', icon: <MdDashboardCustomize className='text-[1em]'/> },
    { path: '/budget-estimator', label: 'Estimator', icon: <MdAddChart className='text-[1em]'/> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Custom UserMenu wrapper with profile picture
  const UserMenuWithAvatar = () => {
    return <UserMenu profilePicture={profilePicture} />;
  };

  return (
    <>
      <nav className="bg-background-subtle border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 ">
            {/* Left side - Logo */}
            <Link to="/" className="flex w-[16%] items-center gap-2 pl-[.25em] pr-[1em] py-2 rounded-lg">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <div className="bg-secondary" style={{
                  maskImage: `url(${FinaSmartIcon})`,
                  maskSize: 'cover',
                  maskPosition: 'center',
                  maskRepeat: 'no-repeat',
                  width: '100%', 
                  height: '100%' 
                }}></div>
              </div>
              <span className="text-[1.2em] tracking-[.15em] text-secondary font-black text-lg hidden sm:inline">
                WealthSmart
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1 tracking-[.15em] text-[1em] font-bold gap-[1em]">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-darkest'
                      : 'text-text hover:bg-background-hover'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-text hover:bg-background-hover transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <HiOutlineX className="text-2xl" />
              ) : (
                <HiOutlineMenu className="text-2xl" />
              )}
            </button>

            {/* Desktop Right side - Settings and User */}
            <div className="hidden md:flex items-center flex-row-reverse pl-[.25em] pr-[1em] py-2 w-[16%]">
              {user ? (
                <>
                  <UserMenuWithAvatar />
                  <SettingsDropdown />
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <SettingsDropdown />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu for Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background-subtle border-b border-border shadow-lg">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`px-4 py-3 rounded-md transition-colors flex items-center gap-3 ${
                      location.pathname === item.path
                        ? 'bg-primary text-primary-darkest'
                        : 'text-text hover:bg-background-hover'
                    }`}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background-subtle border-t border-border z-40">
        <div className="flex justify-around items-center px-4 py-2">
          <div className="flex-1 flex justify-center">
            {user ? (
              <UserMenuWithAvatar />
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-darkest transition-colors font-medium text-sm"
              >
                Login
              </Link>
            )}
          </div>
          <div className="flex-1 flex justify-center">
            {user && <SettingsDropdown />}
          </div>
        </div>
      </div>

      {/* Add padding to bottom on mobile */}
      <div className="md:hidden pb-20"></div>
    </>
  );
}