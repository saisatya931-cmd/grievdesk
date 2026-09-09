import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

// Module-level transition lock to prevent concurrent transitions during rapid clicking
let isThemeTransitioning = false;

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Initialize theme class on mount
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);

  /**
   * Lightweight GPU-Accelerated Theme Transition
   * Restores the signature GrievDesk radial reveal animation.
   * Duration: 380ms (within 350–450ms target)
   * Easing: cubic-bezier(0.4, 0, 0.2, 1)
   * Operates purely on GPU compositor textures with zero child DOM recalculations.
   */
  const toggleTheme = useCallback(
    (e) => {
      // Prevent rapid-click frame drops and transition interruptions
      if (isThemeTransitioning) return;
      isThemeTransitioning = true;

      // 1. Calculate origin coordinates of the toggle click
      let x = typeof window !== 'undefined' ? window.innerWidth - 60 : 0;
      let y = 40;

      if (e && typeof e.clientX === 'number' && typeof e.clientY === 'number' && (e.clientX !== 0 || e.clientY !== 0)) {
        x = e.clientX;
        y = e.clientY;
      } else if (e?.currentTarget && typeof e.currentTarget.getBoundingClientRect === 'function') {
        const rect = e.currentTarget.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }

      // 2. Compute maximum radial distance to screen corners
      const maxRadius = Math.hypot(
        Math.max(x, typeof window !== 'undefined' ? window.innerWidth - x : 1000),
        Math.max(y, typeof window !== 'undefined' ? window.innerHeight - y : 1000)
      );

      const nextDark = !isDark;

      // 3. Native View Transition API (Chromium/Safari) - Pure GPU Texture Transition
      if (typeof document !== 'undefined' && 'startViewTransition' in document) {
        const transition = document.startViewTransition(() => {
          setIsDark(nextDark);
          if (nextDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        });

        transition.ready.then(() => {
          document.documentElement.animate(
            [
              { clipPath: `circle(0px at ${x}px ${y}px)` },
              { clipPath: `circle(${maxRadius}px at ${x}px ${y}px)` },
            ],
            {
              duration: 380,
              easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        });

        transition.finished.finally(() => {
          isThemeTransitioning = false;
        });
      } else {
        // 4. Lightweight Fallback for environments without View Transition API
        setIsDark(nextDark);
        if (nextDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }

        setTimeout(() => {
          isThemeTransitioning = false;
        }, 380);
      }
    },
    [isDark]
  );

  const value = {
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      isDark: typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
      toggleTheme: () => {},
    };
  }
  return context;
};

