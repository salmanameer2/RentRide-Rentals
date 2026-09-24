import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Car, Search, User, Shield, LogOut } from 'lucide-react';
import Button from './Button';
import Container from './Container';
import { useAuth } from '../context/AuthContext';

/**
 * Responsive Customer Navbar component matching reference design
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // Close mobile menu on route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle scroll appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCustomerLogout = async () => {
    await logout(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Fleet', path: '/fleet' },
    { name: 'About', path: '/about' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0b0f12]/95 backdrop-blur-md border-b border-slate-800/80 py-3 shadow-lg'
          : 'bg-[#0b0f12]/80 backdrop-blur-sm border-b border-white/5 py-4'
      }`}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bef264] rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1c242b] border border-slate-700/80 flex items-center justify-center text-[#bef264] group-hover:border-[#bef264]/60 transition-colors shadow-sm">
              <Car className="w-5 h-5 transition-transform group-hover:scale-110" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
              Rent<span className="text-[#bef264]">Rides</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] inline-block animate-pulse" />
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? 'text-[#bef264] bg-[#bef264]/10 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            {/* Customer Navigation for Authenticated Users */}
            {isAuthenticated && (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                      isActive
                        ? 'text-[#bef264] bg-[#bef264]/10 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/bookings"
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                      isActive
                        ? 'text-[#bef264] bg-[#bef264]/10 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  Bookings
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                      isActive
                        ? 'text-[#bef264] bg-[#bef264]/10 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  Profile
                </NavLink>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/fleet"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              title="Browse Fleet"
              aria-label="Search and Browse fleet"
            >
              <Search className="w-4 h-4" />
            </Link>

            {isAuthenticated ? (
              /* Authenticated as Customer: Customer Portal buttons */
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#161f26] border border-slate-700 hover:border-slate-500 text-white transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#bef264]" />
                  <span>{user?.fullName?.split(' ')[0] || 'My Account'}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleCustomerLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Unauthenticated Guest */
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>

                <Button
                  variant="primary"
                  size="sm"
                  to="/signup"
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/fleet"
              className="p-2 text-slate-300 hover:text-white rounded-lg"
              aria-label="Browse cars"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bef264]"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-6 mt-3 border-t border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5 mb-5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-base font-medium transition-colors ${
                      isActive
                        ? 'text-[#bef264] bg-[#bef264]/10 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              {isAuthenticated && (
                <>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-base font-medium text-[#bef264] hover:bg-white/5"
                  >
                    My Dashboard
                  </NavLink>
                  <NavLink
                    to="/bookings"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    My Bookings
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    Driver Profile
                  </NavLink>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    handleCustomerLogout();
                    setIsOpen(false);
                  }}
                  className="w-full justify-center text-red-400 border-red-500/30"
                >
                  Log Out
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    to="/login"
                    className="w-full justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    to="/signup"
                    className="w-full justify-center font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
