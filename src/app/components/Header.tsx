import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Globe, User, Heart, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImg from 'figma:asset/2c0c890448470f4d5843c2af87e08224128b43e5.png';

type CurrentUser = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

const CURRENT_USER_KEY = 'aruqCurrentUser';

const getCurrentUser = (): CurrentUser | null => {
  try {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Cultural Events', path: '/events' },
    { name: 'Archive', path: '/archive' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSearchClick = () => {
    navigate('/archive');
    setIsOpen(false);
  };

  const handleLanguageClick = () => {
    alert('Arabic/English language switching is a future feature for this prototype.');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      {/* Top Bar */}
      <div className="bg-pal-black text-white py-1 px-4 text-xs font-medium text-center tracking-wider">
        PRESERVING PALESTINIAN HERITAGE & MEMORY
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 overflow-hidden rounded-md transition-transform group-hover:scale-105">
              <img
                src={logoImg}
                alt="A'ruq Logo"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-pal-black leading-none tracking-tight">
                A'ruq{' '}
                <span className="font-arabic text-3xl ml-1 text-pal-red">
                  عروق
                </span>
              </h1>

              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-medium mt-1">
                Where Roots Speak
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors relative py-1 hover:text-pal-red ${
                  isActive(link.path)
                    ? 'text-pal-red font-semibold'
                    : 'text-stone-600'
                }`}
              >
                {link.name}

                {isActive(link.path) && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-pal-red"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              type="button"
              onClick={handleSearchClick}
              className="text-stone-500 hover:text-pal-black transition-colors"
              title="Search Archive"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-stone-200"></div>

            {currentUser ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-pal-green transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-pal-green transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleLanguageClick}
              className="text-stone-500 hover:text-pal-black transition-colors"
              title="Switch Language"
            >
              <Globe className="w-5 h-5" />
            </button>

            <Link
              to="/donate"
              className="bg-pal-red text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Heart className="w-4 h-4 fill-current" />
              Donate
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-pal-black p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Open menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium py-2 border-b border-stone-50 ${
                    isActive(link.path) ? 'text-pal-red' : 'text-stone-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleSearchClick}
                className="flex items-center gap-2 text-stone-600 font-medium py-2 border-b border-stone-50"
              >
                <Search className="w-5 h-5" />
                Search Archive
              </button>

              <button
                type="button"
                onClick={handleLanguageClick}
                className="flex items-center gap-2 text-stone-600 font-medium py-2 border-b border-stone-50"
              >
                <Globe className="w-5 h-5" />
                Switch Language
              </button>

              <div className="flex flex-col gap-4 mt-4">
                {currentUser ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-stone-600 font-medium"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-stone-600 font-medium"
                  >
                    <User className="w-5 h-5" />
                    Login / Register
                  </Link>
                )}

                <Link
                  to="/donate"
                  onClick={() => setIsOpen(false)}
                  className="bg-pal-red text-white text-center py-3 rounded-md font-semibold"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};