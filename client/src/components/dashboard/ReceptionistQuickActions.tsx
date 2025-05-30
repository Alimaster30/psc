import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ReceptionistQuickActions: React.FC = () => {
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
        {/* Register Patient */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/patients/new')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-600/30 dark:to-blue-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-blue-200 group-hover:to-blue-300 dark:group-hover:from-blue-600/40 dark:group-hover:to-blue-800/40 transition-all duration-300 shadow-md border border-blue-300/50 dark:border-blue-700/20 group-hover:shadow-blue-300/30 dark:group-hover:shadow-blue-700/20">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-100 group-hover:text-blue-800 dark:group-hover:text-white transition-colors">Register Patient</span>
        </motion.div>

        {/* Schedule Appointment */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/appointments/new')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-600/30 dark:to-indigo-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-indigo-200 group-hover:to-indigo-300 dark:group-hover:from-indigo-600/40 dark:group-hover:to-indigo-800/40 transition-all duration-300 shadow-md border border-indigo-300/50 dark:border-indigo-700/20 group-hover:shadow-indigo-300/30 dark:group-hover:shadow-indigo-700/20">
            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-100 group-hover:text-indigo-800 dark:group-hover:text-white transition-colors">Schedule Appointment</span>
        </motion.div>

        {/* Create Invoice */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/billing/new')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-600/30 dark:to-green-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-green-200 group-hover:to-green-300 dark:group-hover:from-green-600/40 dark:group-hover:to-green-800/40 transition-all duration-300 shadow-md border border-green-300/50 dark:border-green-700/20 group-hover:shadow-green-300/30 dark:group-hover:shadow-green-700/20">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-green-700 dark:text-green-100 group-hover:text-green-800 dark:group-hover:text-white transition-colors">Create Invoice</span>
        </motion.div>

        {/* Print Receipt */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/billing/receipt')}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-600/30 dark:to-purple-800/30 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3 group-hover:from-purple-200 group-hover:to-purple-300 dark:group-hover:from-purple-600/40 dark:group-hover:to-purple-800/40 transition-all duration-300 shadow-md border border-purple-300/50 dark:border-purple-700/20 group-hover:shadow-purple-300/30 dark:group-hover:shadow-purple-700/20">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-purple-700 dark:text-purple-100 group-hover:text-purple-800 dark:group-hover:text-white transition-colors">Print Receipt</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReceptionistQuickActions;
