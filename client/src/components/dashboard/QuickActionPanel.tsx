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
    <div className="bg-gray-900 dark:bg-gray-800 text-white py-4 px-6 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>

      <motion.div
        className="grid grid-cols-4 gap-8"
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
          <div className="w-14 h-14 bg-blue-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600/30 transition-colors">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">My Patients</span>
        </motion.div>

        {/* My Appointments */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/appointments')}
        >
          <div className="w-14 h-14 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600/30 transition-colors">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">My Appointments</span>
        </motion.div>

        {/* New Prescription */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/prescriptions/new')}
        >
          <div className="w-14 h-14 bg-green-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-600/30 transition-colors">
            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">New Prescription</span>
        </motion.div>

        {/* Patient Images */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center cursor-pointer group"
          onClick={() => navigate('/patient-images')}
        >
          <div className="w-14 h-14 bg-purple-600/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-600/30 transition-colors">
            <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Patient Images</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuickActionPanel;
