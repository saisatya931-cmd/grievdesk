import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const AdminNotificationPopup = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { activePopup, dismissPopup, handleNotificationClick } = useNotifications();

  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressIntervalRef = useRef(null);
  const DURATION = 6000; // 6 seconds total
  const remainingTimeRef = useRef(DURATION);
  const lastTickRef = useRef(Date.now());

  // Only show for admins on Admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');
  const shouldDisplay = user?.role === 'admin' && isAdminRoute && !!activePopup;

  // Handle countdown progress bar & auto-dismiss with pause on hover
  useEffect(() => {
    if (!shouldDisplay || !activePopup) {
      setProgress(100);
      remainingTimeRef.current = DURATION;
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    remainingTimeRef.current = DURATION;
    setProgress(100);
    lastTickRef.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      if (isHovered) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (remainingTimeRef.current / DURATION) * 100;
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        clearInterval(progressIntervalRef.current);
        dismissPopup();
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [activePopup, shouldDisplay, isHovered, dismissPopup]);

  if (!shouldDisplay || !activePopup) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'warning':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          accent: 'from-amber-500 to-amber-600',
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          accent: 'from-emerald-500 to-emerald-600',
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-gold-500 dark:text-gold-400" />,
          badge: 'bg-gold-500/10 text-gold-700 dark:text-gold-300 border-gold-500/30',
          accent: 'from-gold-500 to-gold-600',
        };
    }
  };

  const currentStyles = getTypeStyles(activePopup.type);

  return (
    <div
      className="fixed top-20 right-4 sm:right-6 z-50 pointer-events-auto flex flex-col items-end"
      role="region"
      aria-live="polite"
      aria-label="Admin notifications"
    >
      <AnimatePresence>
        <motion.div
          key={activePopup._id || 'admin-toast'}
          initial={{ opacity: 0, y: -20, scale: 0.92, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -16, scale: 0.92, filter: 'blur(4px)', transition: { duration: 0.2 } }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative w-[calc(100vw-2rem)] sm:w-96 max-w-sm bg-white/95 dark:bg-[#171B22]/95 backdrop-blur-md rounded-xl shadow-2xl border border-silver-200 dark:border-charcoal-700 overflow-hidden cursor-pointer hover:border-gold-500/40 dark:hover:border-gold-500/40 transition-all duration-200"
          onClick={() => handleNotificationClick(activePopup)}
        >
          {/* Top subtle gradient accent line */}
          <div className={`h-1 w-full bg-gradient-to-r ${currentStyles.accent}`} />

          <div className="p-4 sm:p-4.5">
            {/* Header: Icon, Badge, and Close Button */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-silver-100 dark:bg-charcoal-800 flex-shrink-0 flex items-center justify-center">
                  {currentStyles.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border text-gold-700 dark:text-gold-300 bg-gold-500/10 border-gold-500/30">
                      Admin Alert
                    </span>
                    <span className="text-[10px] text-silver-400 dark:text-silver-500 font-medium">
                      Just now
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-charcoal-900 dark:text-silver-100 truncate mt-1">
                    {activePopup.title}
                  </h4>
                </div>
              </div>

              {/* Close / Dismiss button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissPopup();
                }}
                className="p-1 rounded-md text-silver-400 hover:text-charcoal-900 dark:hover:text-silver-100 hover:bg-silver-100 dark:hover:bg-charcoal-800 transition-colors flex-shrink-0"
                title="Dismiss notification"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-xs text-charcoal-600 dark:text-silver-300 mt-2.5 line-clamp-2 leading-relaxed pl-1">
              {activePopup.message}
            </p>

            {/* Action Footer */}
            <div className="mt-3 pt-2.5 border-t border-silver-100 dark:border-charcoal-800/80 flex items-center justify-between text-[11px]">
              <span className="text-gold-600 dark:text-gold-400 font-medium flex items-center gap-1 group-hover:underline">
                <span>Open in Complaints</span>
                <ExternalLink size={12} className="inline group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-silver-400 dark:text-silver-500 text-[10px]">
                {isHovered ? 'Paused' : 'Auto-dismiss'}
              </span>
            </div>
          </div>

          {/* Bottom auto-dismiss countdown progress bar */}
          <div className="h-0.5 w-full bg-silver-100 dark:bg-charcoal-800 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${currentStyles.accent} transition-all duration-75`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
