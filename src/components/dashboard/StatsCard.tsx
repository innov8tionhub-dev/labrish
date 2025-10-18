import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  description?: string;
  onClick?: () => void;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  description,
  onClick,
  delay = 0
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value === 0) return <Minus className="w-4 h-4" />;
    return trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value === 0) return 'text-gray-500';
    return trend.isPositive ? 'text-emerald-600' : 'text-red-600';
  };

  return (
    <motion.div
      className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 ${
        onClick ? 'cursor-pointer hover:shadow-xl' : ''
      } transition-all duration-300`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center text-white`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <h3 className="text-3xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-sm text-gray-600 mb-1">{title}</p>

      {(trend?.label || description) && (
        <p className="text-xs text-gray-500 mt-2">
          {trend?.label || description}
        </p>
      )}
    </motion.div>
  );
};

export default StatsCard;
