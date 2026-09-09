import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  RefreshCw,
  PieChart,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { Button, Skeleton, Badge } from '../components/ui';

export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getAnalytics();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return (
    <div className="container-max py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-primary text-xs font-bold mb-2">
            <BarChart3 size={14} />
            <span>Campus Intelligence & Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Institutional Grievance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time resolution velocity, category bottlenecks, and compliance performance metrics.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchAnalytics}>
          <RefreshCw size={14} className="mr-1.5" />
          <span>Refresh Analytics</span>
        </Button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton height="h-28" count={1} />
          <Skeleton height="h-28" count={1} />
          <Skeleton height="h-28" count={1} />
          <Skeleton height="h-28" count={1} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Resolution Rate */}
          <div className="card p-5 border-l-4 border-emerald-500 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
              <span>Resolution Rate</span>
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {data?.resolutionRate || 0}%
            </div>
            <p className="text-[11px] text-gray-400">
              {data?.resolvedComplaints || 0} of {data?.totalComplaints || 0} complaints resolved
            </p>
          </div>

          {/* Average Resolution Time */}
          <div className="card p-5 border-l-4 border-blue-500 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
              <span>Avg Resolution Time</span>
              <Clock size={18} className="text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {data?.avgResolutionTime > 0 ? `${data.avgResolutionTime} days` : '< 24 hours'}
            </div>
            <p className="text-[11px] text-gray-400">
              From submission to closure
            </p>
          </div>

          {/* Total Grievances */}
          <div className="card p-5 border-l-4 border-indigo-500 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
              <span>Total Grievances</span>
              <FileText size={18} className="text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              {data?.totalComplaints || 0}
            </div>
            <p className="text-[11px] text-gray-400">
              Logged across all campus departments
            </p>
          </div>

          {/* Open / Active Tickets */}
          <div className="card p-5 border-l-4 border-amber-500 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
              <span>Active In Pipeline</span>
              <TrendingUp size={18} className="text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {Math.max(0, (data?.totalComplaints || 0) - (data?.resolvedComplaints || 0))}
            </div>
            <p className="text-[11px] text-gray-400">
              Pending review, action, or repair
            </p>
          </div>
        </div>
      )}

      {/* Monthly Grievance Trends Bar Chart */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <span>Monthly Grievance Activity Trends</span>
            </h3>
            <p className="text-xs text-gray-400">
              Number of grievances received and resolved month-by-month
            </p>
          </div>
        </div>

        {loading ? (
          <Skeleton height="h-48" count={1} />
        ) : data?.monthlyTrends && data.monthlyTrends.length > 0 ? (
          <div className="pt-6">
            <div className="flex items-end gap-6 h-44 border-b border-gray-200 dark:border-gray-700 pb-2 px-4 overflow-x-auto">
              {data.monthlyTrends.map((m, idx) => {
                const heightPct = Math.min(100, Math.max(15, (m.count / Math.max(...data.monthlyTrends.map((t) => t.count), 1)) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-[50px]">
                    <span className="text-xs font-bold text-primary">{m.count}</span>
                    <div
                      className="w-full bg-gradient-to-t from-primary to-indigo-500 rounded-t-md transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-semibold text-gray-500">
                      {monthNames[(m._id?.month || 1) - 1]} {m._id?.year}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-gray-400">
            No historical trend data available yet. Trends will populate automatically as complaints are logged.
          </div>
        )}
      </div>

      {/* Category Breakdown & Priority Distribution Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              <span>Grievances by Campus Category</span>
            </h3>
          </div>

          {loading ? (
            <Skeleton height="h-32" count={2} />
          ) : data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
            <div className="space-y-3 pt-2">
              {data.categoryDistribution.map((cat) => {
                const pct = data.totalComplaints > 0 ? Math.round((cat.count / data.totalComplaints) * 100) : 0;
                return (
                  <div key={cat._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">{cat._id}</span>
                      <span className="text-gray-500">{cat.count} tickets ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              No category distribution data available yet.
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <span>Severity & Priority Distribution</span>
            </h3>
          </div>

          {loading ? (
            <Skeleton height="h-32" count={2} />
          ) : data?.priorityDistribution && data.priorityDistribution.length > 0 ? (
            <div className="space-y-3 pt-2">
              {data.priorityDistribution.map((p) => {
                const pct = data.totalComplaints > 0 ? Math.round((p.count / data.totalComplaints) * 100) : 0;
                const color =
                  p._id === 'Critical' || p._id === 'High'
                    ? 'bg-red-500'
                    : p._id === 'Medium'
                    ? 'bg-amber-500'
                    : 'bg-blue-500';
                return (
                  <div key={p._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 dark:text-gray-300">{p._id} Priority</span>
                      <span className="text-gray-500">{p.count} tickets ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              No priority distribution data available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
