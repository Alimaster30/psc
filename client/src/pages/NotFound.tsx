import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../components/common/ThemeToggle';
import MedicalModel from '../components/three/MedicalModel';

// Animated text component
const AnimatedText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  return (
    <span className="inline-block">
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.2,
            delay: delay + index * 0.03,
            ease: "easeOut"
          }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

// Floating button component with hover effect
const FloatingButton: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{
        scale: isHovered ? 1.05 : 1,
        y: [0, -5, 0],
      }}
      transition={{
        scale: { duration: 0.2 },
        y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
      }}
    >
      <Link
        to={to}
        className="inline-flex items-center px-6 py-3 border-2 border-primary-600 dark:border-primary-400 text-base font-medium rounded-md text-primary-600 dark:text-primary-400 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200 shadow-lg hover:shadow-primary-500/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </Link>
    </motion.div>
  );
};

// Main NotFound component
const NotFound: React.FC = () => {
  const [modelType, setModelType] = useState<'pill' | 'dna' | 'stethoscope'>('stethoscope');
  const [showTip, setShowTip] = useState(false);

  // Cycle through different 3D models every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setModelType(prev => {
        if (prev === 'stethoscope') return 'pill';
        if (prev === 'pill') return 'dna';
        return 'stethoscope';
      });
    }, 8000);

    // Show the interaction tip after a delay
    const tipTimer = setTimeout(() => {
      setShowTip(true);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(tipTimer);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header with theme toggle */}
      <header className="py-6 px-8 flex justify-end">
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 md:px-8 max-w-6xl mx-auto w-full gap-8">
        {/* Left side: Text content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-1/2"
        >
          {/* 404 heading with animated gradient */}
          <motion.h1
            className="text-7xl md:text-9xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ backgroundSize: '200% 200%' }}
          >
            404
          </motion.h1>

          {/* Animated divider line */}
          <motion.div
            className="w-16 h-1 bg-primary-600 dark:bg-primary-400 mb-8"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          ></motion.div>

          {/* Message with animated text */}
          <h2 className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-4">
            <AnimatedText text="Hmm, that's not right." delay={0.5} />
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-lg">
            <AnimatedText
              text="Let's get you back on track. The page you're looking for doesn't exist or has been moved."
              delay={0.8}
            />
          </p>

          {/* Floating return button */}
          <FloatingButton to="/">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              ></path>
            </svg>
            Return to Dashboard
          </FloatingButton>
        </motion.div>

        {/* Right side: 3D model */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full md:w-1/2 h-[300px] md:h-[400px] mt-8 md:mt-0 relative"
        >
          {/* 3D model container */}
          <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={modelType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <MedicalModel modelType={modelType} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Interaction tip */}
          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg text-sm text-gray-600 dark:text-gray-300"
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-primary-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                  </svg>
                  Click and drag to interact with the model
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer with animated decorative elements */}
      <footer className="py-12 relative overflow-hidden">
        {/* Animated blob */}
        <motion.div
          className="absolute bottom-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-20 dark:opacity-10"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-primary-300 dark:fill-primary-700">
            <path d="M42.7,-62.9C56.7,-53.5,70.3,-42.8,76.4,-28.5C82.4,-14.2,80.9,3.7,74.9,19.1C68.9,34.6,58.5,47.6,45.1,57.1C31.7,66.6,15.8,72.5,0.2,72.2C-15.5,71.9,-31,65.4,-44.9,55.8C-58.8,46.2,-71.1,33.5,-76.2,17.8C-81.3,2.1,-79.2,-16.6,-71.2,-31.9C-63.2,-47.2,-49.3,-59.1,-34.7,-68.1C-20.1,-77.1,-4.8,-83.2,8.4,-79.8C21.6,-76.4,28.7,-72.3,42.7,-62.9Z" transform="translate(100 100)" />
          </svg>
        </motion.div>

        {/* Small floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-primary-500/30 dark:bg-primary-400/20"
            style={{
              left: `${10 + i * 15}%`,
              top: `${60 + (i % 3) * 10}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Need help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Contact your system administrator
              </p>
            </div>

            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Prime Skin Clinic</span>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
