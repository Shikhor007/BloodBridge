import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Menu, X, User, LogIn, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-xl bg-blood-700 flex items-center justify-center text-white shadow-md shadow-blood-700/20 group-hover:bg-blood-800 transition-colors">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-navy-950 block leading-tight">
                Blood<span className="text-blood-700">Bridge</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 block">
                Connecting Lives
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-blood-700 transition-colors">Home</Link>
            <Link to="/blood-availability" className="hover:text-blood-700 transition-colors">Blood Availability</Link>
            <Link to="/how-it-works" className="hover:text-blood-700 transition-colors">How It Works</Link>
            <Link to="/about" className="hover:text-blood-700 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-blood-700 transition-colors">Contact</Link>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 text-navy-950 hover:bg-slate-200 transition-colors"
                >
                  <User className="w-4 h-4 text-blood-700" />
                  <span>{user.fullName || 'Dashboard'}</span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-blood-100 text-blood-800 font-bold uppercase">
                    {user.roleName}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2.5 text-sm font-semibold text-navy-950 hover:text-blood-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blood-700 hover:bg-blood-800 shadow-md shadow-blood-700/25 transition-all transform hover:-translate-y-0.5"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/blood-availability"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Blood Availability
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            How It Works
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Contact
          </Link>

          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(getDashboardPath());
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-navy-950 text-white font-medium text-sm"
                >
                  My Dashboard ({user.roleName})
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 text-rose-600 font-medium text-sm"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-300 text-slate-800 font-medium text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-blood-700 text-white font-medium text-sm shadow"
                >
                  Register Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
