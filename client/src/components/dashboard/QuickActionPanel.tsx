import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface QuickActionProps {
  role?: string;
}

const QuickActionPanel: React.FC<QuickActionProps> = ({ role }) => {
  const navigate = useNavigate();

  // Animation variants for staggered animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 text-gray-800 dark:text-white py-5 px-8 rounded-lg shadow-lg mb-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        Quick Actions
      </h2>

      <motion.div
        className="grid grid-cols-4 gap-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* My Patients */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/patients')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-600/30 dark:to-blue-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-600/40 dark:group-hover:to-blue-800/40 transition-all duration-300 shadow-md border border-blue-300/50 dark:border-blue-700/20 group-hover:shadow-blue-300/30 dark:group-hover:shadow-blue-700/20">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-100 group-hover:text-blue-800 dark:group-hover:text-white transition-colors">My Patients</span>
        </motion.div>

        {/* My Appointments */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/appointments')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-600/30 dark:to-indigo-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-indigo-200 group-hover:to-indigo-300 dark:group-hover:from-indigo-600/40 dark:group-hover:to-indigo-800/40 transition-all duration-300 shadow-md border border-indigo-300/50 dark:border-indigo-700/20 group-hover:shadow-indigo-300/30 dark:group-hover:shadow-indigo-700/20">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-100 group-hover:text-indigo-800 dark:group-hover:text-white transition-colors">My Appointments</span>
        </motion.div>

        {/* New Prescription */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/prescriptions/new')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-600/30 dark:to-green-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-green-200 group-hover:to-green-300 dark:group-hover:from-green-600/40 dark:group-hover:to-green-800/40 transition-all duration-300 shadow-md border border-green-300/50 dark:border-green-700/20 group-hover:shadow-green-300/30 dark:group-hover:shadow-green-700/20">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-green-700 dark:text-green-100 group-hover:text-green-800 dark:group-hover:text-white transition-colors">New Prescription</span>
        </motion.div>

        {/* Patient Images */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/patient-images')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-600/30 dark:to-purple-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-purple-200 group-hover:to-purple-300 dark:group-hover:from-purple-600/40 dark:group-hover:to-purple-800/40 transition-all duration-300 shadow-md border border-purple-300/50 dark:border-purple-700/20 group-hover:shadow-purple-300/30 dark:group-hover:shadow-purple-700/20">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-purple-700 dark:text-purple-100 group-hover:text-purple-800 dark:group-hover:text-white transition-colors">Patient Images</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuickActionPanel;
