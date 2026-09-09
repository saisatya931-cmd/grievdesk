import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  LogOut,
  User,
  CheckCheck,
  Clock,
  ExternalLink,
  Shield,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const notifRef = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const {
    notifications,
    unreadCount,
    loadingNotifications,
    fetchNotifications,
    markAllAsRead,
    handleNotificationClick: contextHandleNotificationClick,
  } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle click outside notifications dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth scroll listener for landing page sections
  useEffect(() => {
    if (location.pathname !== '/' || isAuthenticated) return;

    const sections = ['home', 'features', 'how-it-works', 'faq'];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 140;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname, isAuthenticated]);

  // Scroll to hash target if navigating from an external page
  useEffect(() => {
    if (location.hash && location.pathname === '/') {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(id);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = async (notification) => {
    setNotificationsOpen(false);
    await contextHandleNotificationClick(notification);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = isAuthenticated
    ? user?.role === 'admin'
      ? [
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Students', href: '/admin/students' },
          { label: 'Complaints', href: '/admin/complaints' },
          { label: 'Analytics', href: '/admin/analytics' },
        ]
      : [
          { label: 'Dashboard', href: '/student/dashboard' },
          { label: 'My Complaints', href: '/student/complaints' },
          { label: 'New Complaint', href: '/student/complaints/new' },
          { label: 'AI Assistant', href: '/student/ai' },
        ]
    : [
        { label: 'Home', href: '/#home', targetId: 'home' },
        { label: 'Features', href: '/#features', targetId: 'features' },
        { label: 'How It Works', href: '/#how-it-works', targetId: 'how-it-works' },
        { label: 'FAQ', href: '/#faq', targetId: 'faq' },
      ];

  const profilePath = user?.role === 'admin' ? '/admin/profile' : '/student/profile';

  // Section smooth scrolling handler (prevents page reload)
  const handleNavClick = (e, item) => {
    if (!isAuthenticated && item.targetId) {
      e.preventDefault();
      const targetId = item.targetId;

      if (location.pathname === '/') {
        if (targetId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setActiveSection('home');
          window.history.pushState(null, '', '/');
        } else {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(targetId);
            window.history.pushState(null, '', `/#${targetId}`);
          }
        }
      } else {
        navigate(`/#${targetId}`);
      }
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F1115]/95 backdrop-blur-md border-b border-[#E2E5E9] dark:border-[#343A46] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Official GrievDesk Brand Identity with Uploaded Logo */}
          <Link
            to={isAuthenticated ? (user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/'}
            onClick={(e) => {
              if (!isAuthenticated && location.pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveSection('home');
                window.history.pushState(null, '', '/');
              }
            }}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              {/* Metallic Ring Frame matching logo colors */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full p-[2px] bg-gradient-to-tr from-[#CBD5E1] via-[#B8892E] to-[#1F2937] dark:from-silver-400 dark:via-[#C89B3C] dark:to-charcoal-700 shadow-md group-hover:scale-105 transition-all">
                <img
                  src="/logo.png"
                  alt="GrievDesk Official Logo"
                  className="w-full h-full object-cover rounded-full bg-[#FAF5EA] dark:bg-[#0E1420]"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#B8892E] dark:bg-[#C89B3C] border-2 border-white dark:border-[#0F1115] rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#1F2937] dark:text-white">
                  Griev<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B8892E] via-[#D4A94F] to-[#B8892E] dark:from-[#C89B3C] dark:via-[#E0B85C] dark:to-[#C89B3C] font-extrabold">Desk</span>
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#B8892E]/10 text-[#B8892E] border border-[#B8892E]/30 dark:bg-[#C89B3C]/10 dark:text-[#C89B3C] dark:border-[#C89B3C]/40 leading-none">
                  Official
                </span>
              </div>
              <span className="text-[10px] font-semibold text-[#6B7280] dark:text-[#9CA3AF] tracking-wider uppercase">
                Institutional Grievance Framework
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = isAuthenticated
                ? location.pathname === item.href
                : activeSection === item.targetId;

              if (!isAuthenticated && item.targetId) {
                return (
                  <button
                    key={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`text-sm font-semibold px-3.5 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#FAF6EE] text-[#B8892E] border border-[#B8892E]/30 dark:bg-[#241C12]/90 dark:text-[#E0B85C] dark:border-[#C89B3C]/40 shadow-xs'
                        : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#B8892E] dark:hover:text-[#E0B85C] hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`text-sm font-semibold px-3.5 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#FAF6EE] text-[#B8892E] border border-[#B8892E]/30 dark:bg-[#241C12]/90 dark:text-[#E0B85C] dark:border-[#C89B3C]/40 shadow-xs'
                      : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#B8892E] dark:hover:text-[#E0B85C] hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#4B5563] hover:text-[#1F2937] dark:text-[#9CA3AF] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028] transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={19} className="text-[#E0B85C]" /> : <Moon size={19} className="text-[#4B5563]" />}
            </button>

            {/* Notification Bell Dropdown */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    if (!notificationsOpen) fetchNotifications();
                  }}
                  className="p-2 rounded-lg text-[#4B5563] hover:text-[#1F2937] dark:text-[#9CA3AF] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028] transition-colors relative cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Modal */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1B2028] rounded-xl shadow-2xl border border-[#E2E5E9] dark:border-[#343A46] z-50 overflow-hidden"
                    >
                      <div className="p-3.5 bg-[#F9FAFB] dark:bg-[#202630] border-b border-[#E2E5E9] dark:border-[#343A46] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1F2937] dark:text-white">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-[#B8892E]/10 text-[#B8892E] dark:bg-[#C89B3C]/10 dark:text-[#E0B85C] text-xs font-bold border border-[#B8892E]/30 dark:border-[#C89B3C]/30">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-[#B8892E] dark:text-[#E0B85C] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                          >
                            <CheckCheck size={14} />
                            <span>Mark all read</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E5E9] dark:divide-[#343A46]">
                        {loadingNotifications ? (
                          <div className="p-6 text-center text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                            Loading updates...
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 hover:bg-[#F9FAFB] dark:hover:bg-[#252C36] cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-[#B8892E]/5 dark:bg-[#C89B3C]/10' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">
                                  {n.title}
                                </h4>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-[#B8892E] dark:bg-[#C89B3C] flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] mt-1 line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1 mt-1.5">
                                <Clock size={10} />
                                {new Date(n.createdAt).toLocaleDateString()} at{' '}
                                {new Date(n.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center space-y-2">
                            <Bell className="mx-auto text-[#9CA3AF]" size={28} />
                            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                              No notifications yet. You will be alerted when your complaint status changes.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 bg-[#F9FAFB] dark:bg-[#202630] border-t border-[#E2E5E9] dark:border-[#343A46] text-center">
                        <Link
                          to={user?.role === 'admin' ? '/admin/complaints' : '/student/complaints'}
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-medium text-[#B8892E] dark:text-[#E0B85C] hover:underline"
                        >
                          View All Complaints →
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Avatar Pill & Logout Button */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to={profilePath}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-sm font-semibold ${
                    location.pathname === profilePath
                      ? 'border-[#B8892E] bg-[#FAF6EE] text-[#B8892E] dark:border-[#C89B3C] dark:bg-[#241C12]/90 dark:text-[#E0B85C] shadow-xs'
                      : 'border-[#E2E5E9] dark:border-[#343A46] hover:border-[#B8892E] dark:hover:border-[#C89B3C] text-[#1F2937] dark:text-[#D1D5DB] hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028]'
                  }`}
                  title="View Your Profile"
                >
                  <div className="w-6 h-6 rounded-full bg-[#B8892E] dark:bg-[#C89B3C] text-white dark:text-[#0F1115] flex items-center justify-center text-xs font-bold shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="capitalize">{user?.name || 'Account'}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#6B7280] hover:text-red-600 dark:text-[#9CA3AF] dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Log Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-semibold px-3.5 py-2 text-[#1F2937] dark:text-[#D1D5DB] hover:text-[#B8892E] dark:hover:text-[#E0B85C] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm shadow-sm font-semibold px-4 py-2"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              className="md:hidden p-2 rounded-lg text-charcoal-700 dark:text-silver-300 hover:bg-silver-100 dark:hover:bg-charcoal-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-silver-200 dark:border-charcoal-800 py-4 space-y-1.5 bg-white dark:bg-charcoal-950"
            >
              {navItems.map((item) => {
                const isActive = isAuthenticated
                  ? location.pathname === item.href
                  : activeSection === item.targetId;

                if (!isAuthenticated && item.targetId) {
                  return (
                    <button
                      key={item.href}
                      onClick={(e) => handleNavClick(e, item)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                          : 'text-charcoal-700 dark:text-silver-300 hover:bg-silver-100 dark:hover:bg-charcoal-800'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/30'
                        : 'text-charcoal-700 dark:text-silver-300 hover:bg-silver-100 dark:hover:bg-charcoal-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <div className="pt-3 border-t border-silver-200 dark:border-charcoal-800 space-y-2">
                  <Link
                    to={profilePath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-charcoal-700 dark:text-silver-200 hover:bg-silver-100 dark:hover:bg-charcoal-800"
                  >
                    <User size={18} className="text-gold-500" />
                    <span>My Profile ({user?.name})</span>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-silver-200 dark:border-charcoal-800 space-y-2 px-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 text-sm font-semibold text-charcoal-700 dark:text-silver-300 hover:bg-silver-100 dark:hover:bg-charcoal-800 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center py-2 text-sm font-semibold btn-primary rounded-lg shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
