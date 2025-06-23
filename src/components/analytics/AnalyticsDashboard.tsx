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
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/lib/analytics';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalListens: number;
    totalShares: number;
    engagementRate: number;
    averageListenTime: number;
    topPerformingStory: string;
  };
  timeSeriesData: {
    date: string;
    views: number;
    listens: number;
    shares: number;
    engagement: number;
  }[];
  storyPerformance: {
    id: string;
    title: string;
    views: number;
    listens: number;
    shares: number;
    likes: number;
    duration: string;
    category: string;
    publishDate: string;
  }[];
  audienceInsights: {
    demographics: {
      age: { range: string; percentage: number }[];
      location: { country: string; percentage: number }[];
      device: { type: string; percentage: number }[];
    };
    behavior: {
      peakHours: { hour: number; activity: number }[];
      averageSessionDuration: number;
      returnVisitorRate: number;
    };
  };
}

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
    label: 'Last 30 days'
  });
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'listens' | 'shares' | 'engagement'>('views');
  const [refreshing, setRefreshing] = useState(false);
  
  const { track } = useAnalytics();

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

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual analytics service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: AnalyticsData = {
        overview: {
          totalViews: 12847,
          totalListens: 8934,
          totalShares: 456,
          engagementRate: 73.2,
          averageListenTime: 185, // seconds
          topPerformingStory: "Anansi and the Golden Mango"
        },
        timeSeriesData: generateTimeSeriesData(),
        storyPerformance: [
          {
            id: '1',
            title: 'Anansi and the Golden Mango',
            views: 2847,
            listens: 2103,
            shares: 89,
            likes: 234,
            duration: '4:32',
            category: 'folklore',
            publishDate: '2024-01-15'
          },
          {
            id: '2',
            title: 'Caribbean Sunset Meditation',
            views: 1923,
            listens: 1456,
            shares: 67,
            likes: 189,
            duration: '6:15',
            category: 'wellness',
            publishDate: '2024-01-20'
          },
          {
            id: '3',
            title: 'Island Breeze Adventure',
            views: 1654,
            listens: 1234,
            shares: 45,
            likes: 156,
            duration: '3:48',
            category: 'adventure',
            publishDate: '2024-01-25'
          }
        ],
        audienceInsights: {
          demographics: {
            age: [
              { range: '18-24', percentage: 23 },
              { range: '25-34', percentage: 34 },
              { range: '35-44', percentage: 28 },
              { range: '45-54', percentage: 12 },
              { range: '55+', percentage: 3 }
            ],
            location: [
              { country: 'Jamaica', percentage: 32 },
              { country: 'Trinidad & Tobago', percentage: 18 },
              { country: 'Barbados', percentage: 15 },
              { country: 'United States', percentage: 20 },
              { country: 'United Kingdom', percentage: 10 },
              { country: 'Canada', percentage: 5 }
            ],
            device: [
              { type: 'Mobile', percentage: 68 },
              { type: 'Desktop', percentage: 25 },
              { type: 'Tablet', percentage: 7 }
            ]
          },
          behavior: {
            peakHours: generatePeakHoursData(),
            averageSessionDuration: 420, // seconds
            returnVisitorRate: 67.8
          }
        }
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSeriesData = () => {
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

  const generatePeakHoursData = () => {
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity: Math.floor(Math.random() * 100) + 20
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    track('analytics_refreshed', { date_range: selectedDateRange.label });
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const handleExport = () => {
    track('analytics_exported', { 
      date_range: selectedDateRange.label,
      metric: selectedMetric 
    });
    // Implement export functionality
    console.log('Exporting analytics data...');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load analytics data</p>
          <Button onClick={loadAnalyticsData}>Try Again</Button>
        </div>
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="font-heading text-4xl text-gray-800 mb-2">Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive insights into your content performance</p>
            </div>
            
            <div className="flex items-center gap-4">
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

              <Button
                onClick={handleExport}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatNumber(analyticsData.overview.totalViews)}</h3>
            <p className="text-gray-600">Total Views</p>
            <div className="mt-2 text-sm text-green-600">+12.5% from last period</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatNumber(analyticsData.overview.totalListens)}</h3>
            <p className="text-gray-600">Total Listens</p>
            <div className="mt-2 text-sm text-green-600">+8.3% from last period</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-6 h-6 text-pink-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{formatNumber(analyticsData.overview.totalShares)}</h3>
            <p className="text-gray-600">Total Shares</p>
            <div className="mt-2 text-sm text-green-600">+15.7% from last period</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">{analyticsData.overview.engagementRate}%</h3>
            <p className="text-gray-600">Engagement Rate</p>
            <div className="mt-2 text-sm text-green-600">+3.2% from last period</div>
          </div>
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
            
            {/* Simplified chart representation */}
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive chart showing {selectedMetric} over time</p>
                <p className="text-sm text-gray-500 mt-2">
                  {analyticsData.timeSeriesData.length} data points for {selectedDateRange.label}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Top Stories */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="font-heading text-xl text-gray-800 mb-6">Top Performing Stories</h3>
            <div className="space-y-4">
              {analyticsData.storyPerformance.slice(0, 5).map((story, index) => (
                <div key={story.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 truncate">{story.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{formatNumber(story.views)} views</span>
                      <span>{formatNumber(story.listens)} listens</span>
                      <span>{story.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Audience Insights */}
        <motion.div 
          className="grid lg:grid-cols-2 gap-8 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Demographics */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
            <h3 className="font-heading text-xl text-gray-800 mb-6">Audience Demographics</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Age Distribution</h4>
                <div className="space-y-2">
                  {analyticsData.audienceInsights.demographics.age.map(age => (
                    <div key={age.range} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{age.range}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${age.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-800 w-8">{age.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Top Locations</h4>
                <div className="space-y-2">
                  {analyticsData.audienceInsights.demographics.location.slice(0, 4).map(location => (
                    <div key={location.country} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{location.country}</span>
                      <span className="text-sm font-medium text-gray-800">{location.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Behavior Insights */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-emerald-200/50 p-6">
            <h3 className="font-heading text-xl text-gray-800 mb-6">Behavior Insights</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatDuration(analyticsData.audienceInsights.behavior.averageSessionDuration)}
                  </div>
                  <div className="text-sm text-blue-700">Avg. Session</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.audienceInsights.behavior.returnVisitorRate}%
                  </div>
                  <div className="text-sm text-green-700">Return Rate</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Peak Activity Hours</h4>
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Peak hours: 7-9 PM</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Device Usage</h4>
                <div className="space-y-2">
                  {analyticsData.audienceInsights.demographics.device.map(device => (
                    <div key={device.type} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{device.type}</span>
                      <span className="text-sm font-medium text-gray-800">{device.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;