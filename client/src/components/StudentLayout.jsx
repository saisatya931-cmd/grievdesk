import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bot,
  Settings,
  Menu,
  X,
  CheckCheck,
  Clock,
  LogOut,
  User,
  Shield,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';

export const StudentLayout = ({ children, onOpenTrackModal }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const {
    notifications,
    unreadCount,
    loadingNotifications,
    fetchNotifications,
    markAllAsRead,
    handleNotificationClick: contextHandleNotificationClick,
  } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl + K / Cmd + K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        } else if (onOpenTrackModal) {
          onOpenTrackModal();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenTrackModal]);

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (!headerSearchQuery.trim()) return;
    navigate(`/student/complaints?search=${encodeURIComponent(headerSearchQuery.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNotificationItemClick = async (n) => {
    setNotificationsOpen(false);
    await contextHandleNotificationClick(n);
  };

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'Demo Student';

  const studentInitial = displayName.charAt(0).toUpperCase();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/student/dashboard',
      icon: LayoutDashboard,
      isActive: location.pathname === '/student/dashboard',
    },
    {
      label: 'My Complaints',
      href: '/student/complaints',
      icon: FileText,
      isActive: location.pathname === '/student/complaints',
    },
    {
      label: 'New Complaint',
      href: '/student/complaints/new',
      icon: PlusCircle,
      isActive: location.pathname === '/student/complaints/new',
    },
    {
      label: 'Track Complaint',
      href: '#track',
      icon: Search,
      isAction: true,
      onClick: () => {
        if (onOpenTrackModal) {
          onOpenTrackModal();
        } else {
          navigate('/student/dashboard?track=1');
        }
      },
    },
    {
      label: 'AI Assistant',
      href: '/student/ai',
      icon: Bot,
      isActive: location.pathname === '/student/ai' || location.pathname === '/student/ai-assistant',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0B0F15] text-[#1F2937] dark:text-[#F8FAFC] flex flex-col font-sans">
      {/* =========================================================================
          TOP HEADER BAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full h-[72px] bg-white dark:bg-[#111620] border-b border-[#EBE8DF] dark:border-[#1C2330] flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
        {/* Left: Official GrievDesk Brand */}
        <div className="flex items-center gap-3 w-64 flex-shrink-0">
          <Link to="/student/dashboard" className="flex items-center gap-3 group">
            {/* Metallic Ring Emblem Frame */}
            <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#CBD5E1] via-[#D49838] to-[#1F2937] dark:from-silver-400 dark:via-[#E5A93C] dark:to-charcoal-800 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src="/logo.png"
                alt="GrievDesk Logo"
                className="w-full h-full object-cover rounded-full bg-[#FAF5EA] dark:bg-[#0E1420]"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#D49838] dark:bg-[#E5A93C] border-2 border-white dark:border-[#111620] rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-[#1F2937] dark:text-white">
                  Griev<span className="text-[#D49838] dark:text-[#E5A93C]">Desk</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#D49838]/10 text-[#D49838] border border-[#D49838]/30 dark:bg-[#E5A93C]/10 dark:text-[#E5A93C] dark:border-[#E5A93C]/40 leading-none">
                  Official
                </span>
              </div>
              <span className="text-[9px] font-semibold text-[#6B7280] dark:text-[#94A3B8] tracking-wider uppercase">
                INSTITUTIONAL GRIEVANCE FRAMEWORK
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Search Complaints Bar with Ctrl+K shortcut */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <form onSubmit={handleHeaderSearch} className="w-full relative">
            <div className="relative flex items-center">
              <Search
                size={18}
                className="absolute left-3.5 text-[#6B7280] dark:text-[#94A3B8] pointer-events-none"
              />
              <input
                id="student-header-search"
                name="headerSearchQuery"
                aria-label="Search complaints, track status"
                ref={searchInputRef}
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                placeholder="Search complaints, track status..."
                className="w-full pl-10 pr-20 py-2 rounded-lg bg-white dark:bg-[#151B26] border border-[#E2DFD6] dark:border-[#232B3B] text-sm text-[#1F2937] dark:text-white placeholder-[#9CA3AF] dark:placeholder-[#64748B] focus:outline-none focus:border-[#D49838] dark:focus:border-[#E5A93C] shadow-xs transition-colors"
              />
              <div className="absolute right-2.5 flex items-center">
                <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#F7F5F0] dark:bg-[#202838] border border-[#EBE8DF] dark:border-[#2B364A] text-[#6B7280] dark:text-[#94A3B8] select-none shadow-xs">
                  Ctrl + K
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Action Icons: Theme Toggle, Notifications, Profile Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Theme Toggle Pill Switch */}
          <button
            onClick={toggleTheme}
            className="flex items-center bg-[#EDE8DC] dark:bg-[#161D2A] border border-[#E2DFD6] dark:border-[#232B3B] rounded-full p-1 hover:border-[#D49838]/40 dark:hover:border-[#E5A93C]/40 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div
              className={`p-1 rounded-full transition-all ${
                isDark ? 'text-[#64748B]' : 'bg-[#D49838]/20 text-[#D49838]'
              }`}
            >
              <Sun size={15} />
            </div>
            <div
              className={`p-1 rounded-full transition-all ${
                isDark ? 'bg-[#252C36] text-[#E5A93C]' : 'text-[#6B7280]'
              }`}
            >
              <Moon size={15} />
            </div>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (!notificationsOpen) fetchNotifications();
              }}
              className="p-2 rounded-lg text-[#4B5563] hover:text-[#1F2937] hover:bg-[#F0F1F3] dark:text-[#9CA3AF] dark:hover:text-white dark:hover:bg-[#1B2028] transition-colors relative"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
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
                      <span className="font-bold text-sm text-[#1F2937] dark:text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#B8892E]/10 text-[#B8892E] dark:bg-[#C89B3C]/10 dark:text-[#E0B85C] text-xs font-bold border border-[#B8892E]/30 dark:border-[#C89B3C]/30">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-[#B8892E] dark:text-[#E0B85C] hover:underline flex items-center gap-1 font-medium"
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
                          onClick={() => handleNotificationItemClick(n)}
                          className={`p-3.5 hover:bg-[#F9FAFB] dark:hover:bg-[#252C36] cursor-pointer transition-colors ${
                            !n.isRead ? 'bg-[#B8892E]/5 dark:bg-[#C89B3C]/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold text-[#1F2937] dark:text-white">{n.title}</h4>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#B8892E] dark:bg-[#C89B3C] flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] mt-1 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1 mt-1.5">
                            <Clock size={10} />
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center space-y-2">
                        <Bell className="mx-auto text-[#9CA3AF]" size={28} />
                        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                          No notifications yet. You will be alerted when your complaint updates.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 bg-[#F9FAFB] dark:bg-[#202630] border-t border-[#E2E5E9] dark:border-[#343A46] text-center">
                    <Link
                      to="/student/complaints"
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

          {/* Student Profile Pill with Avatar circle "D", Demo Student, and chevron */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-2.5 rounded-full hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028] border border-transparent hover:border-[#E2E5E9] dark:hover:border-[#343A46] transition-all group text-left cursor-pointer"
            >
              {/* Amber/Gold Circular Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#B8892E] dark:bg-[#C89B3C] text-white dark:text-[#0F1115] flex items-center justify-center font-bold text-sm shadow-md">
                {studentInitial}
              </div>

              {/* Name & Role */}
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs sm:text-sm font-bold text-[#1F2937] dark:text-white group-hover:text-[#B8892E] dark:group-hover:text-[#E0B85C] transition-colors">
                  {displayName}
                </span>
                <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Student</span>
              </div>

              <ChevronDown
                size={15}
                className={`text-[#6B7280] dark:text-[#9CA3AF] transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1B2028] rounded-xl shadow-2xl border border-[#E2E5E9] dark:border-[#343A46] py-2 z-50 divide-y divide-[#E2E5E9] dark:divide-[#343A46]"
                >
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Signed in as</p>
                    <p className="text-sm font-bold text-[#1F2937] dark:text-white truncate">{displayName}</p>
                    {user?.studentId && (
                      <p className="text-[11px] font-mono text-[#B8892E] dark:text-[#E0B85C] mt-0.5">
                        ID: {user.studentId}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/student/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1F2937] dark:text-[#D1D5DB] hover:text-[#B8892E] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#252C36] transition-colors"
                    >
                      <User size={14} className="text-[#B8892E] dark:text-[#C89B3C]" />
                      <span>View Profile</span>
                    </Link>
                    <Link
                      to="/student/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#1F2937] dark:text-[#D1D5DB] hover:text-[#B8892E] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#252C36] transition-colors"
                    >
                      <Settings size={14} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028]"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          BODY LAYOUT: SIDEBAR (LEFT) + MAIN CONTENT (RIGHT)
          ========================================================================= */}
      <div className="flex-1 flex min-w-0 relative">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#F7F5F0] dark:bg-[#0D121B] border-r border-[#EBE8DF] dark:border-[#1C2330] flex-col justify-between p-4 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          {/* Top Navigation Links */}
          <div className="space-y-1.5">
            {navItems.map((item) => {
              if (item.isAction) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-white hover:bg-[#EFECE3] dark:hover:bg-[#141A26] transition-colors text-left group cursor-pointer"
                  >
                    <item.icon
                      size={19}
                      className="text-[#6B7280] dark:text-[#94A3B8] group-hover:text-[#D49838] dark:group-hover:text-[#E5A93C] transition-colors"
                    />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    item.isActive
                      ? 'bg-gradient-to-r from-[#E5B260] to-[#D29B42] text-[#1F2937] border border-[#D49838]/60 shadow-xs font-semibold dark:bg-gradient-to-r dark:from-[#C89B3C]/25 dark:to-[#C89B3C]/08 dark:text-[#E5A93C] dark:border-[#C89B3C]/50'
                      : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-white hover:bg-[#EFECE3] dark:hover:bg-[#141A26]'
                  }`}
                >
                  <item.icon
                    size={19}
                    className={item.isActive ? 'text-[#1F2937] dark:text-[#E5A93C]' : 'text-[#6B7280] dark:text-[#94A3B8]'}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Subtle Divider */}
            <div className="pt-2 pb-2">
              <hr className="border-t border-[#EBE8DF] dark:border-[#1C2330]" />
            </div>

            {/* Settings Nav Item */}
            <Link
              to="/student/profile"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/student/profile'
                  ? 'bg-gradient-to-r from-[#E5B260] to-[#D29B42] text-[#1F2937] border border-[#D49838]/60 shadow-xs font-semibold dark:bg-gradient-to-r dark:from-[#C89B3C]/25 dark:to-[#C89B3C]/08 dark:text-[#E5A93C] dark:border-[#C89B3C]/50'
                  : 'text-[#4B5563] dark:text-[#94A3B8] hover:text-[#1F2937] dark:hover:text-white hover:bg-[#EFECE3] dark:hover:bg-[#141A26]'
              }`}
            >
              <Settings size={19} className="text-[#6B7280] dark:text-[#94A3B8]" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Bottom Sidebar Illustration & Cursive Motto matching reference images */}
          <div className="pt-6 pb-2 select-none relative flex flex-col items-center">
            <div className="relative w-full max-w-[145px] h-[165px]">
              {/* Light Theme Sidebar Sketch Artwork */}
              <img
                src="/sidebar-sketch-light.png"
                alt="University Facade - Your Voice Matters"
                className="absolute inset-0 w-full h-full object-contain opacity-100 dark:opacity-0 transition-opacity duration-400 pointer-events-none"
              />
              {/* Dark Theme Sidebar Sketch Artwork */}
              <img
                src="/sidebar-sketch-dark.png"
                alt="University Facade - Your Voice Matters"
                className="absolute inset-0 w-full h-full object-contain opacity-0 dark:opacity-100 transition-opacity duration-400 pointer-events-none"
              />
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -280 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -280 }}
              className="fixed inset-y-0 left-0 top-[72px] z-50 w-72 bg-white dark:bg-[#0F1115] border-r border-[#E2E5E9] dark:border-[#343A46] p-4 flex flex-col justify-between shadow-2xl md:hidden"
            >
              <div className="space-y-2">
                {/* Search Bar on Mobile */}
                <form onSubmit={handleHeaderSearch} className="mb-4">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-3 text-[#6B7280] dark:text-[#9CA3AF] pointer-events-none"
                    />
                    <input
                      id="student-mobile-header-search"
                      name="mobileHeaderSearchQuery"
                      aria-label="Search complaints"
                      type="text"
                      value={headerSearchQuery}
                      onChange={(e) => setHeaderSearchQuery(e.target.value)}
                      placeholder="Search complaints..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#F0F1F3] dark:bg-[#1B2028] border border-[#E2E5E9] dark:border-[#343A46] text-xs text-[#1F2937] dark:text-white"
                    />
                  </div>
                </form>

                {navItems.map((item) => {
                  if (item.isAction) {
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          item.onClick();
                        }}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028] transition-all text-left"
                      >
                        <item.icon size={19} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        item.isActive
                          ? 'border border-[#B8892E]/40 bg-[#FAF6EE] text-[#B8892E] dark:border-[#C89B3C]/40 dark:bg-[#241C12]/80 dark:text-[#E0B85C] font-semibold'
                          : 'text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028]'
                      }`}
                    >
                      <item.icon
                        size={19}
                        className={item.isActive ? 'text-[#B8892E] dark:text-[#E0B85C]' : 'text-[#6B7280] dark:text-[#9CA3AF]'}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                <hr className="border-t border-[#E2E5E9] dark:border-[#343A46] my-2" />

                <Link
                  to="/student/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#1F2937] dark:hover:text-white hover:bg-[#F0F1F3] dark:hover:bg-[#1B2028]"
                >
                  <Settings size={19} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="pt-4 pb-2 text-center">
                <div className="font-script text-xl font-bold text-[#B8892E] dark:text-[#E0B85C] transform -rotate-6">
                  Your Voice Matters
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT CONTAINER */}
        <main className="flex-1 min-w-0 bg-[#F5F6F8] dark:bg-[#0F1115] overflow-x-hidden transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
};
