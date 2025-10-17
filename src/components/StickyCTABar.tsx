import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const StickyCTABar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.8;

      if (isDismissed) return;

      if (currentScrollY > heroHeight && currentScrollY < lastScrollY) {
        setIsVisible(true);
      } else if (currentScrollY < heroHeight || currentScrollY > lastScrollY) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  className="hidden md:block w-2 h-2 bg-white rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-white font-semibold text-sm md:text-base">
                  Start your Caribbean storytelling journey today
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/signup">
                  <motion.button
                    className="bg-white text-emerald-600 px-4 md:px-6 py-2 rounded-full font-semibold text-sm md:text-base flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-md"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get Started Free
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </Link>

                <button
                  onClick={handleDismiss}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                  aria-label="Dismiss banner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTABar;
