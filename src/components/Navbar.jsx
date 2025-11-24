import React, { useState, useRef, useEffect } from 'react';
import icon from '../assets/quiz-icon.png';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { User, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import "tailwindcss";

const Navbar = () => {
  const { isAuthenticated, user, userRole, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/home');
  };

  return (
    <nav className="bg-white shadow-md w-full sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition">
          <img src={icon} alt="Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gray-800">TriviaTrek</span>
        </Link>
        <ul className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <li className="hover:text-blue-600 cursor-pointer transition">
            <Link to="/home">Home</Link>
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition">
            <Link to="/Category">Categories</Link>
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition">
            <Link to="/leaderboard">Leaderboard</Link>
          </li>
          <li className="hover:text-blue-600 cursor-pointer transition">
            <Link to="/about">About</Link>
          </li>
        </ul>
        <div className="flex gap-3 items-center">
          {!isAuthenticated ? (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition text-center font-medium"
              >
                Login
              </Link>
              <Link 
                to="/Signup" 
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-blue-700 font-medium"
              >
                <User size={18} />
                <span className="hidden sm:inline">{user?.name || 'User'}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  {userRole === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
