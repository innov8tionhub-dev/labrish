import React from 'react';
import { motion } from 'framer-motion';

export interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
  badge?: string;
  status?: 'active' | 'inactive' | 'pending';
}

interface DashboardQuickLinksProps {
  links: QuickLink[];
}

const getStatusIndicator = (status: string) => {
  switch (status) {
    case 'active':
      return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
    case 'inactive':
      return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    case 'pending':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />;
    default:
      return null;
  }
};

const DashboardQuickLinks: React.FC<DashboardQuickLinksProps> = ({ links }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <h2 className="font-heading text-2xl text-gray-800 mb-6">Quick Links</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map((link, index) => (
          <motion.div
            key={link.id}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group"
            onClick={link.action}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); link.action(); }}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${link.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIndicator(link.status || 'active')}
                {link.badge && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                    {link.badge}
                  </span>
                )}
              </div>
            </div>
            <h3 className="font-heading text-lg text-gray-800 mb-2 group-hover:text-emerald-600 transition-colors">{link.title}</h3>
            <p className="text-gray-600 text-sm">{link.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DashboardQuickLinks;
