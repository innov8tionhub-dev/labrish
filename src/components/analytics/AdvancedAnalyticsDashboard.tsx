import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  Heart,
  Share2,
  Volume2,
  Target,
  Globe,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/lib/analytics';
import { useNavigate } from 'react-router-dom';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface ChartData {
  date: string;
  views: number;
  listens: number;
  shares: number;
  engagement: number;
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 days'
  });
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'listens' | 'shares' | 'engagement'>('views');
  const [refreshing, setRefreshing] = useState(false);
  const [metricsData, setMetricsData] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  const { track } = useAnalytics();
  const navigate = useNavigate();

  const dateRangeOptions: DateRange[] = [
    {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 7 days'
    },
    {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 30 days'
    },
    {
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last 3 months'
    },
    {
      start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      end: new Date(),
      label: 'Last year'
    }
  ];

  useEffect(() => {
    loadAnalyticsData();
    track('analytics_dashboard_viewed', { date_range: selectedDateRange.label });
  }, [selectedDateRange, track]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (realTimeUpdates) {
      interval = setInterval(() => {
        updateRealTimeData();
      }, 30000); // Update every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeUpdates]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      console.log('Loading analytics data started');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const metrics: MetricCard[] = [
        {
          id: 'total-views',
          title: 'Total Views',
          value: '12,847',
          change: 12.5,
          changeType: 'increase',
          icon: <Eye className="w-6 h-6" />,
          color: 'from-blue-500 to-cyan-500',
          description: 'Total story views across all content'
        },
        {
          id: 'total-listens',
          title: 'Audio Listens',
          value: '8,934',
          change: 8.3,
          changeType: 'increase',
          icon: <Volume2 className="w-6 h-6" />,
          color: 'from-purple-500 to-indigo-500',
          description: 'Complete audio playbacks'
        },
        {
          id: 'total-shares',
          title: 'Shares',
          value: '456',
          change: 15.7,
          changeType: 'increase',
          icon: <Share2 className="w-6 h-6" />,
          color: 'from-pink-500 to-rose-500',
          description: 'Stories shared on social platforms'
        },
        {
          id: 'engagement-rate',
          title: 'Engagement Rate',
          value: '73.2%',
          change: 3.2,
          changeType: 'increase',
          icon: <Target className="w-6 h-6" />,
          color: 'from-emerald-500 to-teal-500',
          description: 'User interaction with content'
        },
        {
          id: 'avg-listen-time',
          title: 'Avg. Listen Time',
          value: '3:05',
          change: -2.1,
          changeType: 'decrease',
          icon: <Clock className="w-6 h-6" />,
          color: 'from-orange-500 to-red-500',
          description: 'Average time spent listening'
        },
        {
          id: 'global-reach',
          title: 'Global Reach',
          value: '47',
          change: 0,
          changeType: 'neutral',
          icon: <Globe className="w-6 h-6" />,
          color: 'from-green-500 to-emerald-500',
          description: 'Countries with active users'
        }
      ];

      const chart = generateTimeSeriesData();
      
      setMetricsData(metrics);
      setChartData(chart);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      console.log('Loading analytics data finished');
      setLoading(false);
    }
  };

  const updateRealTimeData = async () => {
    // Simulate real-time updates
    setMetricsData(prev => prev.map(metric => ({
      ...metric,
      value: typeof metric.value === 'string' && metric.value.includes(',') 
        ? (parseInt(metric.value.replace(/,/g, '')) + Math.floor(Math.random() * 10)).toLocaleString()
        : metric.value,
      change: metric.change + (Math.random() - 0.5) * 2
    })));
  };

  const generateTimeSeriesData = (): ChartData[] => {
    const data = [];
    const days = Math.floor((selectedDateRange.end.getTime() - selectedDateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(selectedDateRange.start.getTime() + i * 24 * 60 * 60 * 1000);
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 500) + 100,
        listens: Math.floor(Math.random() * 300) + 50,
        shares: Math.floor(Math.random() * 50) + 5,
        engagement: Math.floor(Math.random() * 30) + 60
      });
    }
    
    return data;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    track('analytics_refreshed', { date_range: selectedDateRange.label });
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleExport = (format: 'csv' | 'pdf' | 'json') => {
    track('analytics_exported', { 
      date_range: selectedDateRange.label,
      metric: selectedMetric,
      format 
    });
    
    // Simulate export
    const data = {
      dateRange: selectedDateRange.label,
      metrics: metricsData,
      chartData: chartData,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labrish-analytics-${selectedDateRange.label.toLowerCase().replace(/\s+/g, '-')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'decrease': return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'neutral': return <Minus className="w-4 h-4 text-gray-600" />;
      default: return null;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="font-heading text-4xl text-gray-800 mb-2">Advanced Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into your content performance</p>
              {realTimeUpdates && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600">Live updates enabled</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Real-time Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={realTimeUpdates}
                  onChange={(e) => setRealTimeUpdates(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Real-time</span>
              </label>

              {/* Date Range Selector */}
              <select
                value={selectedDateRange.label}
                onChange={(e) => {
                  const range = dateRangeOptions.find(r => r.label === e.target.value);
                  if (range) setSelectedDateRange(range);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {dateRangeOptions.map(range => (
                  <option key={range.label} value={range.label}>
                    {range.label}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              {/* Export Dropdown */}
              <div className="relative group">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="p-2">
                    <button
                      onClick={() => handleExport('csv')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      Export as PDF
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {metricsData.map((metric, index) => (
            <motion.div
              key={metric.id}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6 hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-lg flex items-center justify-center text-white`}>
                  {metric.icon}
                </div>
                <div className="flex items-center gap-1">
                  {getChangeIcon(metric.changeType)}
                  <span className={`text-sm font-medium ${getChangeColor(metric.changeType)}`}>
                    {Math.abs(metric.change).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm mb-2">{metric.title}</p>
              <p className="text-xs text-gray-500">{metric.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Chart */}
          <motion.div 
            className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl text-gray-800">Performance Trends</h3>
              <div className="flex items-center gap-2">
                {(['views', 'listens', 'shares', 'engagement'] as const).map(metric => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedMetric === metric
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Interactive Chart Placeholder */}
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive chart showing {selectedMetric} over time</p>
                <p className="text-sm text-gray-500 mt-2">
                  {chartData.length} data points for {selectedDateRange.label}
                </p>
              </div>
              
              {/* Simulated Chart Data Visualization */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between h-32">
                {chartData.slice(0, 20).map((data, index) => (
                  <div
                    key={index}
                    className="bg-emerald-500 rounded-t opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ 
                      height: `${(data[selectedMetric] / Math.max(...chartData.map(d => d[selectedMetric]))) * 100}%`,
                      width: `${100 / 20}%`
                    }}
                    title={`${data.date}: ${data[selectedMetric]}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Side Panel */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Top Performing Content */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
              <h3 className="font-heading text-lg text-gray-800 mb-4">Top Performing</h3>
              <div className="space-y-3">
                {[
                  { title: 'Anansi and the Golden Mango', views: '2.8K', trend: 'up' },
                  { title: 'Caribbean Sunset Meditation', views: '1.9K', trend: 'up' },
                  { title: 'Island Breeze Adventure', views: '1.6K', trend: 'down' },
                  { title: 'Folklore Tales Collection', views: '1.2K', trend: 'up' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.views} views</p>
                    </div>
                    <div className="ml-2">
                      {item.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
              <h3 className="font-heading text-lg text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure Tracking
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Advanced Analytics
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;