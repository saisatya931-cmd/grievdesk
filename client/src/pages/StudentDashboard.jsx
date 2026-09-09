import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  PlusCircle,
  FileText,
  Bot,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RotateCcw,
  Zap,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dashboardAPI, complaintAPI } from '../services/api';
import { Button, Badge, EmptyState, Skeleton, Modal } from '../components/ui';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    statistics: {
      totalComplaints: 0,
      submitted: 0,
      underReview: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
    },
    recentComplaints: [],
  });

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardAPI.getStudentDashboard();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading student dashboard:', err);
      setError('Unable to load your dashboard. Please make sure the server is reachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Check URL params for ?track=1 from sidebar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('track') === '1') {
      setSearchModalOpen(true);
    }
  }, [location.search]);

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await complaintAPI.getMy({ search: searchId.trim() });
      const complaints = res.data?.data || [];
      const match = complaints.find(
        (c) =>
          c.complaintId?.toLowerCase() === searchId.trim().toLowerCase() ||
          c._id === searchId.trim() ||
          c.title.toLowerCase().includes(searchId.trim().toLowerCase())
      );
      if (match) {
        setSearchResult(match);
      } else {
        setSearchResult('not_found');
      }
    } catch (err) {
      setSearchResult('error');
    } finally {
      setSearching(false);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'Critical':
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'info';
      default:
        return 'info';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30">
            <span>🔵</span>
            <span>Submitted</span>
          </span>
        );
      case 'Viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30">
            <span>👁️</span>
            <span>Viewed by Admin</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30">
            <span>🟠</span>
            <span>Under Review</span>
          </span>
        );
      case 'In Progress':
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/30">
            <span>⚙️</span>
            <span>In Progress</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
            <span>🟢</span>
            <span>Resolved</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600">
            <span>🔒</span>
            <span>Closed</span>
          </span>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = data.statistics || {};
  const totalCount = stats.totalComplaints || 0;
  const pendingCount = (stats.submitted || 0) + (stats.underReview || 0);
  const inProgressCount = stats.inProgress || 0;
  const resolvedCount = (stats.resolved || 0) + (stats.closed || 0);

  const resolutionPct =
    totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'Demo Student';

  const studentId = user?.studentId || 'STU-2026-001';

  // 7-day Trend Data for mini chart
  const trendData = [
    { day: 'Sep 1', count: 1 },
    { day: 'Sep 2', count: 2 },
    { day: 'Sep 3', count: 1.8 },
    { day: 'Sep 4', count: 2.6 },
    { day: 'Sep 5', count: 3.5 },
    { day: 'Sep 6', count: 4.8 },
    { day: 'Sep 7', count: 6 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto text-[#1F2937] dark:text-silver-100 transition-colors">
      {/* =========================================================================
          SECTION 1: HERO / BANNER (Compact Horizontal Composition Matching Reference)
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-[#FBF4E9] dark:bg-[#0E121A] border border-[#E5DAC4] dark:border-[#1E2738] text-[#1F2937] shadow-sm dark:text-white dark:shadow-2xl py-5 px-6 sm:py-6 sm:px-8 transition-colors duration-380">
        {/* Campus Illustration Hero Background (Full-width natural blend, preserved aspect ratio) */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <img
            src="/campus-hero-light.png"
            alt="Campus Illustration Light Theme"
            className="absolute right-0 top-0 bottom-0 h-full w-auto max-w-none object-cover object-right opacity-100 dark:opacity-0 transition-opacity duration-380 [mask-image:linear-gradient(to_right,transparent_0%,black_32px,black_100%)]"
          />
          <img
            src="/campus-hero-dark.png"
            alt="Campus Illustration Dark Theme"
            className="absolute right-0 top-0 bottom-0 h-full w-auto max-w-none object-cover object-right opacity-0 dark:opacity-100 transition-opacity duration-380 [mask-image:linear-gradient(to_right,transparent_0%,black_32px,black_100%)]"
          />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 min-h-[140px]">
          {/* Left Side: Waving Icon, Hello Greeting, Subtitle, Portal Pill */}
          <div className="space-y-2.5 max-w-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl select-none leading-none">👋</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F2937] dark:text-white flex flex-wrap items-center gap-2">
                <span>Hello,</span>
                <span className="text-[#D49838] dark:text-[#E5A93C]">{displayName}!</span>
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#94A3B8] leading-relaxed max-w-md">
              Track and manage your campus complaints from one place.<br className="hidden sm:inline" /> Submit new issues, receive live department updates, and get instant guidance.
            </p>

            {/* Grievdesk Student Portal Pill */}
            <div className="pt-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#0C121D]/90 border border-[#E2E5E9] dark:border-[#1E293B] text-xs font-medium text-[#4B5563] dark:text-silver-300 shadow-xs">
                <Building2 size={14} className="text-[#D49838] dark:text-[#E5A93C]" />
                <span className="font-semibold text-[#1F2937] dark:text-white">Grievdesk Student Portal</span>
                <span className="text-[#9CA3AF] dark:text-[#4B5563]">|</span>
                <span className="font-mono text-[#D49838] dark:text-[#E5A93C] font-bold">ID: {studentId}</span>
              </div>
            </div>

            {/* Mobile / Tablet Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2 lg:hidden">
              <button
                onClick={() => navigate('/student/complaints/new')}
                className="bg-[#D49838] hover:bg-[#C28526] text-[#0B0F15] dark:text-[#0B0F15] font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm text-sm cursor-pointer transition-colors"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>New Complaint</span>
              </button>
              <button
                onClick={() => navigate('/student/complaints')}
                className="bg-white dark:bg-[#121A28]/90 hover:bg-[#F9FAFB] dark:hover:bg-[#1A2538] text-[#1F2937] dark:text-white border border-[#CBD5E1] dark:border-[#2D3A50] font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs text-sm cursor-pointer transition-colors"
              >
                <FileText size={15} />
                <span>My Complaints</span>
              </button>
            </div>
          </div>

          {/* Desktop Action Buttons: Exactly ONE set positioned at bottom right matching reference */}
          <div className="hidden lg:flex items-center gap-3 self-end z-20 pb-0.5">
            <button
              onClick={() => navigate('/student/complaints/new')}
              className="bg-[#D49838] hover:bg-[#C28526] text-[#0B0F15] dark:text-[#0B0F15] font-bold px-4.5 py-2.5 rounded-lg flex items-center gap-2 shadow-sm text-sm cursor-pointer transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Complaint</span>
            </button>
            <button
              onClick={() => navigate('/student/complaints')}
              className="bg-white dark:bg-[#121A28]/90 hover:bg-[#F9FAFB] dark:hover:bg-[#1A2538] text-[#1F2937] dark:text-white border border-[#CBD5E1] dark:border-[#2D3A50] font-medium px-4.5 py-2.5 rounded-lg flex items-center gap-2 shadow-xs text-sm cursor-pointer transition-colors"
            >
              <FileText size={15} />
              <span>My Complaints</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: QUICK ACTIONS
          ========================================================================= */}
      <div className="space-y-3">
        {/* Title Header */}
        <div className="flex items-center gap-2.5">
          <Zap size={20} className="text-[#D49838] dark:text-[#E5A93C] fill-[#D49838] dark:fill-[#E5A93C]" />
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-white">Quick Actions</h2>
            <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Get started with your complaint management</p>
          </div>
        </div>

        {/* 4 Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: New Complaint */}
          <div
            onClick={() => navigate('/student/complaints/new')}
            className="p-4 rounded-xl bg-white hover:bg-[#FAF6EE]/50 border border-[#E5E0D4] hover:border-[#D49838]/40 shadow-xs dark:bg-[#141A26] dark:hover:bg-[#182030] dark:border-[#1E2738] dark:hover:border-[#E5A93C]/40 dark:shadow-none transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-[#FEF5EA] border border-[#F7E5C3] text-[#D49838] dark:bg-[#201A15] dark:border-[#3B2E1C] dark:text-[#E5A93C] flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-[#1F2937] group-hover:text-[#D49838] dark:text-white dark:group-hover:text-[#E5A93C] transition-colors">
                  New Complaint
                </div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">File a campus issue</div>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#F7F5F0] group-hover:bg-[#D49838] group-hover:text-white text-[#6B7280] dark:bg-[#1A2230] dark:group-hover:bg-[#E5A93C] dark:group-hover:text-[#111620] dark:text-[#94A3B8] flex items-center justify-center transition-all flex-shrink-0">
              <ChevronRight size={15} />
            </div>
          </div>

          {/* Card 2: My Complaints */}
          <div
            onClick={() => navigate('/student/complaints')}
            className="p-4 rounded-xl bg-white hover:bg-[#EEF6FC]/50 border border-[#E5E0D4] hover:border-[#2980B9]/40 shadow-xs dark:bg-[#141A26] dark:hover:bg-[#182030] dark:border-[#1E2738] dark:hover:border-[#60A5FA]/40 dark:shadow-none transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-[#EEF6FC] border border-[#D6E8F6] text-[#2980B9] dark:bg-[#141E2C] dark:border-[#1F2E45] dark:text-[#60A5FA] flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-[#1F2937] group-hover:text-[#2980B9] dark:text-white dark:group-hover:text-[#60A5FA] transition-colors">
                  My Complaints
                </div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">View history & status</div>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#F7F5F0] group-hover:bg-[#2980B9] group-hover:text-white text-[#6B7280] dark:bg-[#1A2230] dark:group-hover:bg-[#60A5FA] dark:group-hover:text-[#111620] dark:text-[#94A3B8] flex items-center justify-center transition-all flex-shrink-0">
              <ChevronRight size={15} />
            </div>
          </div>

          {/* Card 3: Track Complaint */}
          <div
            onClick={() => setSearchModalOpen(true)}
            className="p-4 rounded-xl bg-white hover:bg-[#FEF7EB]/50 border border-[#E5E0D4] hover:border-[#D49838]/40 shadow-xs dark:bg-[#141A26] dark:hover:bg-[#182030] dark:border-[#1E2738] dark:hover:border-[#E5A93C]/40 dark:shadow-none transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-[#FEF7EB] border border-[#FDE8C7] text-[#D49838] dark:bg-[#201A15] dark:border-[#3B2E1C] dark:text-[#E5A93C] flex items-center justify-center">
                <Search size={20} />
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-[#1F2937] group-hover:text-[#D49838] dark:text-white dark:group-hover:text-[#E5A93C] transition-colors">
                  Track Complaint
                </div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Instant lookup by ID</div>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#F7F5F0] group-hover:bg-[#D49838] group-hover:text-white text-[#6B7280] dark:bg-[#1A2230] dark:group-hover:bg-[#E5A93C] dark:group-hover:text-[#111620] dark:text-[#94A3B8] flex items-center justify-center transition-all flex-shrink-0">
              <ChevronRight size={15} />
            </div>
          </div>

          {/* Card 4: AI Assistant */}
          <div
            onClick={() => navigate('/student/ai')}
            className="p-4 rounded-xl bg-white hover:bg-[#F5F2FD]/50 border border-[#E5E0D4] hover:border-[#7C3AED]/40 shadow-xs dark:bg-[#141A26] dark:hover:bg-[#182030] dark:border-[#1E2738] dark:hover:border-[#A78BFA]/40 dark:shadow-none transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-[#F5F2FD] border border-[#E8DEF8] text-[#7C3AED] dark:bg-[#1C172C] dark:border-[#2D234A] dark:text-[#A78BFA] flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base text-[#1F2937] group-hover:text-[#7C3AED] dark:text-white dark:group-hover:text-[#A78BFA] transition-colors">
                  AI Assistant
                </div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Instant resolution help</div>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-[#F7F5F0] group-hover:bg-[#7C3AED] group-hover:text-white text-[#6B7280] dark:bg-[#1A2230] dark:group-hover:bg-[#A78BFA] dark:group-hover:text-[#111620] dark:text-[#94A3B8] flex items-center justify-center transition-all flex-shrink-0">
              <ChevronRight size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* Error state if server call fails */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 dark:text-red-400" />
            <span className="text-sm font-medium">{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: COMPLAINT STATISTICS
          ========================================================================= */}
      <div className="space-y-4">
        {/* Header Row: Title on Left, Live status pill on Right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <TrendingUp size={20} className="text-[#D49838] dark:text-[#E5A93C]" />
            <h2 className="text-lg sm:text-xl font-bold text-[#1F2937] dark:text-white">Complaint Statistics</h2>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF7F0] border border-[#C8EDD9] dark:bg-[#0E1F1A] dark:border-[#163A2E]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] dark:bg-[#34D399] animate-pulse" />
            <span className="text-xs text-[#16A34A] dark:text-[#34D399] font-medium">Live system status</span>
          </div>
        </div>

        {/* 5 Cards Row (4 Stat Cards + 1 Line Chart Card) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Skeleton height="h-32" count={1} />
            <Skeleton height="h-32" count={1} />
            <Skeleton height="h-32" count={1} />
            <Skeleton height="h-32" count={1} />
            <Skeleton height="h-32" count={1} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: TOTAL COMPLAINTS */}
            <div className="p-4 rounded-xl bg-[#EEF6FC] border border-[#D6E8F6] shadow-xs dark:bg-[#131B28] dark:border-[#1B293E] dark:shadow-none flex flex-col justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#DBEDFA] border border-[#BFDCF5] text-[#2980B9] dark:bg-[#18253A] dark:border-[#233653] dark:text-[#60A5FA] flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-[#4A709C] dark:text-[#94A3B8] uppercase">
                  TOTAL COMPLAINTS
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-[#111827] dark:text-white">{totalCount}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">All complaints registered</div>
              </div>
            </div>

            {/* Card 2: PENDING (Amber warm glow matching reference) */}
            <div className="p-4 rounded-xl bg-[#FEF6E9] border border-[#FDE8C7] shadow-xs dark:bg-[#1B1713] dark:border-[#2D2319] dark:shadow-none flex flex-col justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#FDE9CE] border border-[#F9D6A3] text-[#D49838] dark:bg-[#282015] dark:border-[#45331E] dark:text-[#E5A93C] flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-[#B45309] dark:text-[#E5A93C] uppercase">
                  PENDING
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-[#B45309] dark:text-[#E5A93C]">{pendingCount}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">
                  Submitted ({stats.submitted || 0}) & Review ({stats.underReview || 0})
                </div>
              </div>
            </div>

            {/* Card 3: IN PROGRESS */}
            <div className="p-4 rounded-xl bg-[#F5F2FD] border border-[#E8DEF8] shadow-xs dark:bg-[#151624] dark:border-[#222438] dark:shadow-none flex flex-col justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#EBE3FA] border border-[#DCD0F6] text-[#7C3AED] dark:bg-[#1E2036] dark:border-[#2F3256] dark:text-[#818CF8] flex items-center justify-center">
                  <RotateCcw size={18} />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-[#6B46C1] dark:text-[#94A3B8] uppercase">
                  IN PROGRESS
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-[#111827] dark:text-white">{inProgressCount}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">
                  Active department resolution
                </div>
              </div>
            </div>

            {/* Card 4: RESOLVED */}
            <div className="p-4 rounded-xl bg-[#EAF7F0] border border-[#C8EDD9] shadow-xs dark:bg-[#111D1B] dark:border-[#193129] dark:shadow-none flex flex-col justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#D5F3E2] border border-[#B6E8CA] text-[#16A34A] dark:bg-[#172A24] dark:border-[#214438] dark:text-[#34D399] flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-[11px] font-bold tracking-wider text-[#15803D] dark:text-[#94A3B8] uppercase">
                  RESOLVED
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-[#111827] dark:text-white">{resolvedCount}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1">Successfully completed</div>
              </div>
            </div>

            {/* Card 5: COMPLAINT TREND (Recharts Mini Area Chart matching reference) */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E5E0D4] shadow-xs dark:bg-[#141A26] dark:border-[#1E2738] dark:shadow-none flex flex-col justify-between transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-[#D49838] dark:text-[#E5A93C]" />
                <span className="text-xs font-semibold text-[#1F2937] dark:text-white">Complaint Trend</span>
              </div>

              <div className="w-full h-24 pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={trendData}
                    margin={{ top: 5, right: 8, left: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="trendGradLight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D49838" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#D49838" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="trendGradDark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E5A93C" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#E5A93C" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={{ stroke: isDark ? '#1E2738' : '#E5E0D4' }}
                      tickLine={false}
                      tick={{ fill: isDark ? '#94A3B8' : '#6B7280', fontSize: 9 }}
                      interval={0}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white dark:bg-[#141A26] border border-[#E5E0D4] dark:border-[#1E2738] px-2 py-1 rounded text-[10px] text-[#1F2937] dark:text-white shadow-md">
                              {payload[0].value} complaints
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="linear"
                      dataKey="count"
                      stroke={isDark ? '#E5A93C' : '#C88A2E'}
                      strokeWidth={2}
                      fill={isDark ? 'url(#trendGradDark)' : 'url(#trendGradLight)'}
                      dot={{ r: 3.5, fill: isDark ? '#E5A93C' : '#C88A2E', stroke: isDark ? '#141A26' : '#FFFFFF', strokeWidth: 1.5 }}
                      activeDot={{ r: 5, fill: isDark ? '#E5A93C' : '#C88A2E' }}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 4: RESOLUTION PIPELINE OVERVIEW
          ========================================================================= */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E0D4] shadow-xs dark:bg-[#141A26] dark:border-[#1E2738] dark:shadow-none space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2.5">
            <Award size={19} className="text-[#D49838] dark:text-[#E5A93C]" />
            <h3 className="font-semibold text-sm sm:text-base text-[#1F2937] dark:text-white">
              Resolution Pipeline Overview
            </h3>
          </div>
          <span className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
            {resolvedCount} of {totalCount || 3} complaints resolved ({totalCount > 0 ? resolutionPct : 33}%)
          </span>
        </div>

        {/* Multi-Segmented Progress Bar */}
        <div className="w-full h-3 bg-[#E2E8F0] dark:bg-[#1A2230] rounded-full overflow-hidden flex p-0.5">
          {/* Resolved Segment (Gold Fill) */}
          <div
            style={{
              width: `${totalCount > 0 ? (resolvedCount / totalCount) * 100 : 33}%`,
            }}
            className="bg-[#D49838] dark:bg-[#E5A93C] h-full rounded-full transition-all duration-500"
            title={`Resolved: ${resolvedCount}`}
          />
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: RECENT COMPLAINTS TABLE
          ========================================================================= */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1F2937] dark:text-white">Recent Complaints</h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Your most recently logged campus grievances</p>
          </div>
          {totalCount > 0 && (
            <Link
              to="/student/complaints"
              className="text-xs sm:text-sm font-semibold text-[#D49838] dark:text-[#E5A93C] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="p-6 rounded-xl bg-white border border-[#E5E0D4] shadow-xs dark:bg-[#141A26] dark:border-[#1E2738] space-y-3">
            <Skeleton height="h-12" count={3} />
          </div>
        ) : data.recentComplaints && data.recentComplaints.length > 0 ? (
          <div className="grid gap-3">
            {data.recentComplaints.map((complaint) => (
              <motion.div
                key={complaint._id}
                whileHover={{ scale: 1.002 }}
                className="p-4 sm:p-5 rounded-xl bg-white hover:bg-[#FAF9F5] border border-[#E5E0D4] hover:border-[#D5CFBE] shadow-xs dark:bg-[#141A26] dark:hover:bg-[#182030] dark:border-[#1E2738] dark:hover:border-[#2D384D] dark:shadow-none transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F7F5F0] text-[#374151] border border-[#E5E0D4] dark:bg-[#1A2230] dark:text-[#D1D5DB] dark:border-[#253247]">
                      {complaint.complaintId || complaint._id.slice(-6).toUpperCase()}
                    </span>
                    <Badge variant={getPriorityBadgeVariant(complaint.priority)}>
                      {complaint.priority}
                    </Badge>
                    {getStatusBadge(complaint.status)}
                    <span className="text-xs text-[#6B7280] dark:text-[#94A3B8] flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-semibold text-[#1F2937] dark:text-white truncate text-base">
                    {complaint.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#94A3B8] line-clamp-1">
                    {complaint.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-[#6B7280] dark:text-[#94A3B8] pt-1">
                    <span className="font-medium text-[#374151] dark:text-[#D1D5DB]">
                      {complaint.category}
                    </span>
                    {complaint.department?.name && (
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {complaint.department.name}
                      </span>
                    )}
                    {complaint.location && <span>📍 {complaint.location}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    onClick={() => setSelectedComplaint(complaint)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F7F5F0] hover:bg-[#EFECE3] text-xs font-semibold text-[#1F2937] border border-[#E5E0D4] dark:bg-[#1A2230] dark:hover:bg-[#222E42] dark:text-white dark:border-[#253247] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Details</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 sm:p-12 rounded-xl bg-white border border-[#E5E0D4] shadow-xs dark:bg-[#141A26] dark:border-[#1E2738] dark:shadow-none">
            <EmptyState
              icon={FileText}
              title="You haven't submitted any complaints yet"
              description="Create your first complaint to report an issue with academics, hostels, campus facilities, or administration."
              action={
                <button
                  onClick={() => navigate('/student/complaints/new')}
                  className="bg-[#D49838] hover:bg-[#C28526] text-white dark:bg-[#E5A93C] dark:hover:bg-[#D4982E] dark:text-[#111620] font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <PlusCircle size={18} />
                  <span>Create Your First Complaint</span>
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL 1: TRACK COMPLAINT SEARCH MODAL
          ========================================================================= */}
      <Modal
        isOpen={searchModalOpen}
        onClose={() => {
          setSearchModalOpen(false);
          setSearchResult(null);
          setSearchId('');
        }}
        title="Track Complaint by ID"
        size="md"
      >
        <form onSubmit={handleTrackSearch} className="space-y-4">
          <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB]">
            Enter your Complaint ID (e.g. COMP-2026-00001) or a keyword to track live progress:
          </p>
          <div className="flex gap-2">
            <input
              id="track-complaint-search-input"
              name="searchId"
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. COMP-2026-00001 or Wi-Fi"
              className="w-full px-4 py-2 rounded-lg bg-white dark:bg-[#0F1115] border border-[#E2E5E9] dark:border-[#343A46] text-sm text-[#1F2937] dark:text-white focus:outline-none focus:border-[#B8892E] dark:focus:border-[#C89B3C]"
              required
            />
            <button
              type="submit"
              disabled={searching}
              className="px-4 py-2 bg-[#B8892E] hover:bg-[#A07525] text-white dark:bg-[#C89B3C] dark:hover:bg-[#B0842E] dark:text-[#0F1115] font-bold rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            >
              {searching ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>
          </div>

          {searchResult === 'not_found' && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-500/30 dark:text-amber-300 rounded-lg text-sm">
              No matching complaints found for "{searchId}". Please check the ID or visit your{' '}
              <Link to="/student/complaints" className="underline font-semibold text-[#B8892E] dark:text-[#E0B85C]">
                Complaints List
              </Link>
              .
            </div>
          )}

          {searchResult && typeof searchResult === 'object' && (
            <div className="p-4 bg-[#F9FAFB] dark:bg-[#0F1115] rounded-lg space-y-2 border border-[#E2E5E9] dark:border-[#343A46]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#B8892E] dark:text-[#E0B85C]">
                  {searchResult.complaintId}
                </span>
                {getStatusBadge(searchResult.status)}
              </div>
              <h4 className="font-semibold text-sm text-[#1F2937] dark:text-white">{searchResult.title}</h4>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] line-clamp-2">
                {searchResult.description}
              </p>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSearchModalOpen(false);
                    setSelectedComplaint(searchResult);
                  }}
                  className="px-3 py-1.5 bg-[#D49838] hover:bg-[#C28526] text-white dark:bg-[#E5A93C] dark:hover:bg-[#D4982E] dark:text-[#111620] font-bold text-xs rounded-lg cursor-pointer"
                >
                  View Complete Timeline
                </button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: COMPLAINT DETAILS TIMELINE MODAL
          ========================================================================= */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Details — ${selectedComplaint.complaintId || selectedComplaint._id.slice(-6).toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-[#1F2937] dark:text-[#F8FAFC]">
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#E5E0D4] dark:border-[#1E2738]">
              {getStatusBadge(selectedComplaint.status)}
              <Badge variant={getPriorityBadgeVariant(selectedComplaint.priority)}>
                {selectedComplaint.priority} Priority
              </Badge>
              <span className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Category: <strong className="text-[#1F2937] dark:text-white">{selectedComplaint.category}</strong>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F2937] dark:text-white">
                {selectedComplaint.title}
              </h3>
              <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mt-2 whitespace-pre-wrap">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.location && (
              <div className="p-2.5 bg-[#F7F5F0] dark:bg-[#111620] rounded-lg text-xs text-[#4B5563] dark:text-[#D1D5DB] border border-[#E5E0D4] dark:border-[#1E2738]">
                📍 <strong className="text-[#1F2937] dark:text-white">Location:</strong> {selectedComplaint.location}
              </div>
            )}

            {selectedComplaint.aiAnalysis?.summary && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <Bot size={14} /> AI Analysis Summary:
                </span>
                <p className="text-blue-900 dark:text-blue-200">{selectedComplaint.aiAnalysis.summary}</p>
              </div>
            )}

            {selectedComplaint.resolution?.resolutionText && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Resolution Notes:
                </span>
                <p className="text-emerald-900 dark:text-emerald-200">
                  {selectedComplaint.resolution.resolutionText}
                </p>
              </div>
            )}

            {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 && (
              <div className="pt-2">
                <h4 className="font-semibold text-sm text-[#1F2937] dark:text-white mb-3">Status Timeline</h4>
                <div className="space-y-3 pl-2 border-l-2 border-[#D49838] dark:border-[#E5A93C]">
                  {selectedComplaint.statusHistory.map((step, idx) => (
                    <div key={idx} className="relative pl-4">
                      <div className="absolute -left-[1.3rem] top-1 w-3 h-3 rounded-full bg-[#D49838] dark:bg-[#E5A93C] ring-4 ring-white dark:ring-[#141A26]" />
                      <div className="font-medium text-sm text-[#1F2937] dark:text-white">{step.status}</div>
                      <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                        {new Date(step.timestamp).toLocaleString()}
                      </div>
                      {step.remark && (
                        <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] mt-0.5">"{step.remark}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#E5E0D4] dark:border-[#1E2738] flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 rounded-lg bg-[#F7F5F0] hover:bg-[#EFECE3] border border-[#E5E0D4] text-xs font-semibold text-[#1F2937] dark:bg-[#1A2230] dark:hover:bg-[#222E42] dark:text-white dark:border-[#253247] cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
