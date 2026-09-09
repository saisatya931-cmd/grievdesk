import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Ban,
  UserCheck,
  Trash2,
  GraduationCap,
  Mail,
  Calendar,
  AlertCircle,
  X,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  Building2,
  Tag,
} from 'lucide-react';
import { dashboardAPI, studentAPI } from '../services/api';
import { Badge, Button, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const AdminDashboard = ({ initialTab = 'overview' }) => {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  // Active view: 'overview' or 'students'
  const [activeTab, setActiveTab] = useState(
    initialTab === 'students' || location.pathname.includes('students') ? 'students' : 'overview'
  );

  // Overview dashboard data
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Student management data & state
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentStats, setStudentStats] = useState({ total: 0, active: 0, suspended: 0, flagged: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Student Details Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Delete Confirmation Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Action loading state (for individual student row status updates)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Sync tab with URL/hash changes
  useEffect(() => {
    if (location.pathname.includes('students') || location.hash === '#students') {
      setActiveTab('students');
    }
  }, [location]);

  // Fetch overview statistics
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getAdminDashboard();
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student accounts with search & filter
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await studentAPI.getAll(params);
      if (res.data?.success) {
        setStudents(res.data.data || []);
        if (res.data.statistics) {
          setStudentStats(res.data.statistics);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load registered student accounts.');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchStudents();
  }, []);

  // Re-fetch students when filter changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, statusFilter]);

  // Open Student Details Modal
  const handleOpenDetails = async (student) => {
    setSelectedStudent(student);
    setViewModalOpen(true);
    setDetailsLoading(true);
    try {
      const res = await studentAPI.getById(student._id);
      if (res.data?.success) {
        setStudentDetails(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      toast.error('Failed to load student details & complaint history.');
    } finally {
      setDetailsLoading(false);
    }
  };

  // Toggle Suspend / Reactivate
  const handleToggleStatus = async (student, newStatus) => {
    setStatusUpdatingId(student._id);
    try {
      const res = await studentAPI.updateStatus(student._id, newStatus);
      if (res.data?.success) {
        toast.success(
          newStatus === 'suspended'
            ? `Student account (${student.email}) suspended.`
            : `Student account (${student.email}) reactivated.`
        );
        // Refresh local student record
        setStudents((prev) =>
          prev.map((s) =>
            s._id === student._id
              ? { ...s, status: newStatus, isActive: newStatus === 'active' }
              : s
          )
        );
        if (selectedStudent?._id === student._id) {
          setSelectedStudent((prev) => ({
            ...prev,
            status: newStatus,
            isActive: newStatus === 'active',
          }));
          if (studentDetails?.student) {
            setStudentDetails((prev) => ({
              ...prev,
              student: { ...prev.student, status: newStatus, isActive: newStatus === 'active' },
            }));
          }
        }
        // Update stats
        fetchStudents();
      }
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update student account status.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  // Confirm Permanent Deletion
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await studentAPI.delete(studentToDelete._id);
      if (res.data?.success) {
        toast.success('Student account permanently deleted and complaints anonymized.');
        setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
        setDeleteModalOpen(false);
        setStudentToDelete(null);
        if (viewModalOpen && selectedStudent?._id === studentToDelete._id) {
          setViewModalOpen(false);
        }
        fetchStudents();
        fetchAdminData();
      }
    } catch (err) {
      console.error('Delete student error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete student account.');
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = data?.statistics || {};

  return (
    <div className="container-max py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-xs font-semibold mb-2">
            <ShieldCheck size={14} className="text-gold-500" />
            <span>Administrative Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">
            Welcome, {user?.name || 'Administrator'}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Campus grievance oversight, student account administration, and resolution governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              fetchAdminData();
              fetchStudents();
            }}
          >
            <RefreshCw size={14} className="mr-1.5" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Navigation Switch Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E5E9] dark:border-[#343A46] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-[#B8892E] dark:bg-[#C89B3C] text-white shadow-sm'
              : 'text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#F0F1F3] dark:hover:bg-[#252C36]'
          }`}
        >
          <FileText size={16} />
          <span>Grievance Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'students'
              ? 'bg-[#B8892E] dark:bg-[#C89B3C] text-white shadow-sm'
              : 'text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#F0F1F3] dark:hover:bg-[#252C36]'
          }`}
        >
          <Users size={16} />
          <span>Student Management</span>
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 font-bold border border-gold-500/30">
            {studentStats.total || stats.totalStudents || 0}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: GRIEVANCES OVERVIEW */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Admin Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton height="h-28" count={1} />
              <Skeleton height="h-28" count={1} />
              <Skeleton height="h-28" count={1} />
              <Skeleton height="h-28" count={1} />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-gold-500">
                <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                  <span>Total Grievances</span>
                  <FileText size={18} className="text-gold-500" />
                </div>
                <div className="text-3xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] mt-2">
                  {stats.totalComplaints || 0}
                </div>
              </div>

              <div className="card p-5 border-l-4 border-amber-500">
                <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                  <span>Under Review</span>
                  <Clock size={18} className="text-amber-500" />
                </div>
                <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                  {(stats.submitted || 0) + (stats.underReview || 0)}
                </div>
              </div>

              <div className="card p-5 border-l-4 border-blue-500">
                <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                  <span>In Progress</span>
                  <TrendingUp size={18} className="text-blue-500" />
                </div>
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                  {stats.inProgress || 0}
                </div>
              </div>

              <div className="card p-5 border-l-4 border-emerald-500">
                <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                  <span>Resolved</span>
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                  {(stats.resolved || 0) + (stats.closed || 0)}
                </div>
              </div>
            </div>
          )}

          {/* User Stats Banner with Quick Student Management CTA */}
          <div className="card p-6 bg-gradient-to-r from-white via-[#F9FAFB] to-white dark:from-[#1B2028] dark:via-[#202630] dark:to-[#1B2028] text-[#1F2937] dark:text-[#F8FAFC] border border-[#E2E5E9] dark:border-gold-500/30 flex flex-wrap items-center justify-between gap-6 shadow-sm">
            <div>
              <h3 className="font-bold text-lg text-[#1F2937] dark:text-[#F8FAFC]">Active Campus Community</h3>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                Registered students and resolution authorities on the platform
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">{studentStats.total || stats.totalStudents || 0}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Total Students</div>
              </div>
              <div className="text-center border-l border-[#E2E5E9] dark:border-[#343A46] pl-6">
                <div className="text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">{stats.totalAdmins || 1}</div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Administrators</div>
              </div>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setActiveTab('students')}
                className="font-semibold"
              >
                <Users size={16} />
                <span>Manage Students</span>
              </Button>
            </div>
          </div>

          {/* Recent Grievances Stream */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Recent Institutional Grievances
            </h2>
            {loading ? (
              <Skeleton height="h-20" count={3} />
            ) : data?.recentComplaints && data.recentComplaints.length > 0 ? (
              <div className="space-y-3">
                {data.recentComplaints.map((c) => (
                  <div
                    key={c._id}
                    className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">
                          {c.complaintId || c._id.slice(-6).toUpperCase()}
                        </span>
                        <Badge variant={c.status === 'Resolved' ? 'success' : 'warning'}>
                          {c.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          From: <strong>{c.student?.name || 'Student'}</strong> ({c.student?.email || ''})
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                        {c.title}
                      </h4>
                    </div>
                    <div className="text-xs text-gray-400 self-end sm:self-center">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center text-gray-500 text-sm">
                No complaints currently logged on the platform.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STUDENT MANAGEMENT SECTION */}
      {/* ======================================================== */}
      {activeTab === 'students' && (
        <div id="students" className="space-y-6">
          {/* Section Banner with Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4 border border-silver-200 dark:border-charcoal-700">
              <div className="flex justify-between items-center text-xs font-semibold text-silver-500 uppercase">
                <span>Total Students</span>
                <Users size={16} className="text-gold-500" />
              </div>
              <div className="text-2xl font-bold text-charcoal-900 dark:text-silver-100 mt-1">
                {studentStats.total || 0}
              </div>
              <div className="text-[11px] text-silver-500 mt-0.5">Registered accounts</div>
            </div>

            <div className="card p-4 border border-emerald-500/30 bg-emerald-500/5">
              <div className="flex justify-between items-center text-xs font-semibold text-emerald-600 uppercase">
                <span>Active Accounts</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {studentStats.active || 0}
              </div>
              <div className="text-[11px] text-emerald-600/80 mt-0.5">Authorized for login</div>
            </div>

            <div className="card p-4 border border-amber-500/30 bg-amber-500/5">
              <div className="flex justify-between items-center text-xs font-semibold text-amber-600 uppercase">
                <span>Suspended Accounts</span>
                <Ban size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
                {studentStats.suspended || 0}
              </div>
              <div className="text-[11px] text-amber-600/80 mt-0.5">Access blocked</div>
            </div>

            <div className="card p-4 border border-red-500/30 bg-red-500/5">
              <div className="flex justify-between items-center text-xs font-semibold text-red-600 uppercase">
                <span>Security Flagged</span>
                <ShieldAlert size={16} className="text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">
                {studentStats.flagged || 0}
              </div>
              <div className="text-[11px] text-red-600/80 mt-0.5">&ge; 3 failed login attempts</div>
            </div>
          </div>

          {/* Institutional Governance Recommendation Callout */}
          <div className="p-4 rounded-xl border border-gold-500/30 bg-gold-500/5 flex items-start gap-3 text-xs sm:text-sm text-charcoal-800 dark:text-silver-200">
            <ShieldCheck size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-charcoal-900 dark:text-white">
                Administrative Governance Guidance:
              </strong>{' '}
              For suspicious, compromised, or unauthorized student accounts, prefer{' '}
              <span className="font-semibold text-amber-700 dark:text-amber-400">Account Suspension</span> over permanent deletion.
              Suspending an account immediately blocks authentication while safeguarding submitted grievances, audit logs, and evidence for institutional review.
            </div>
          </div>

          {/* Search, Filter & Action Toolbar */}
          <div className="card p-4 border border-silver-200 dark:border-charcoal-700 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-silver-400"
              />
              <input
                id="admin-student-search"
                name="searchQuery"
                aria-label="Search students by name, email, or student ID"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or student ID..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-silver-200 dark:border-charcoal-700 bg-silver-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-silver-100 placeholder-silver-400 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-silver-400 hover:text-charcoal-700 dark:hover:text-silver-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label htmlFor="admin-status-filter" className="flex items-center gap-1.5 text-xs text-silver-500 font-semibold uppercase flex-shrink-0 cursor-pointer">
                <Filter size={14} />
                <span>Filter:</span>
              </label>
              <select
                id="admin-status-filter"
                name="statusFilter"
                aria-label="Filter students by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm py-2 px-3 rounded-lg border border-silver-200 dark:border-charcoal-700 bg-silver-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-silver-100 focus:outline-none focus:ring-2 focus:ring-gold-500/50 cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">All Statuses ({studentStats.total || 0})</option>
                <option value="active" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Active ({studentStats.active || 0})</option>
                <option value="suspended" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Suspended ({studentStats.suspended || 0})</option>
                <option value="pending" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Pending Verification</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                onClick={fetchStudents}
                className="text-xs"
                title="Refresh student list"
              >
                <RefreshCw size={14} />
              </Button>
            </div>
          </div>

          {/* Students Directory Table */}
          <div className="card overflow-hidden border border-silver-200 dark:border-charcoal-700">
            {studentsLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton height="h-12" count={4} />
              </div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-silver-500 space-y-2">
                <Users size={36} className="mx-auto text-silver-400" />
                <h4 className="font-semibold text-charcoal-900 dark:text-silver-200">
                  No Student Accounts Found
                </h4>
                <p className="text-xs text-silver-400 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No registered students match the active search query or filter selection.'
                    : 'There are currently no student accounts registered on the platform.'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="mt-2 text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-silver-200 dark:border-charcoal-700 bg-silver-50/80 dark:bg-charcoal-800/80 text-xs font-semibold text-silver-600 dark:text-silver-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-3">Student ID</th>
                      <th className="py-3.5 px-3">Department / Course</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Activity & Security</th>
                      <th className="py-3.5 px-3 text-center">Complaints</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-silver-200 dark:divide-charcoal-700">
                    {students.map((student) => {
                      const isSuspended = student.status === 'suspended' || student.isActive === false;
                      const isPending = student.status === 'pending';
                      const hasSecurityRisk = (student.failedLoginAttempts || 0) >= 3;

                      return (
                        <tr
                          key={student._id}
                          className="hover:bg-silver-50 dark:hover:bg-charcoal-800/50 transition-colors"
                        >
                          {/* Student Name & Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gold-500/20 via-silver-400/30 to-charcoal-700/40 text-charcoal-900 dark:text-gold-400 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-gold-500/30">
                                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                              </div>
                              <div>
                                <div className="font-semibold text-charcoal-900 dark:text-silver-100 flex items-center gap-1.5">
                                  <span>{student.name || 'Unnamed Student'}</span>
                                  {hasSecurityRisk && (
                                    <span
                                      className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500/10 text-red-600 border border-red-500/30"
                                      title="Repeated failed logins detected"
                                    >
                                      <ShieldAlert size={11} />
                                      <span>Flagged</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-silver-500 flex items-center gap-1 mt-0.5">
                                  <Mail size={12} className="text-silver-400" />
                                  <span>{student.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Student ID / Reg Number */}
                          <td className="py-3.5 px-3">
                            {student.studentId ? (
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-silver-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-silver-200 border border-silver-200 dark:border-charcoal-700">
                                {student.studentId}
                              </span>
                            ) : (
                              <span className="text-xs text-silver-400 italic">Not set</span>
                            )}
                          </td>

                          {/* Department / Course */}
                          <td className="py-3.5 px-3 text-xs text-charcoal-700 dark:text-silver-300">
                            {student.department || 'General Academics'}
                          </td>

                          {/* Account Status Badge */}
                          <td className="py-3.5 px-3">
                            {isSuspended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                <Ban size={12} />
                                <span>Suspended</span>
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                                <Clock size={12} />
                                <span>Pending</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 size={12} />
                                <span>Active</span>
                              </span>
                            )}
                          </td>

                          {/* Activity & Security */}
                          <td className="py-3.5 px-3 text-xs">
                            <div className="space-y-0.5 text-silver-500 dark:text-silver-400">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} className="text-silver-400" />
                                <span>Reg: {new Date(student.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} className="text-silver-400" />
                                <span>
                                  Login:{' '}
                                  {student.lastLogin
                                    ? new Date(student.lastLogin).toLocaleDateString()
                                    : 'Never'}
                                </span>
                              </div>
                              {student.failedLoginAttempts > 0 && (
                                <div className="text-[11px] text-red-500 font-medium">
                                  {student.failedLoginAttempts} failed attempt{student.failedLoginAttempts > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Complaints Submitted Count */}
                          <td className="py-3.5 px-3 text-center">
                            <span className="inline-flex items-center justify-center font-bold text-xs px-2.5 py-0.5 rounded-full bg-silver-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-silver-200 border border-silver-200 dark:border-charcoal-700">
                              {student.complaintsCount || 0}
                            </span>
                          </td>

                          {/* Management Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              {/* View Details */}
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(student)}
                                className="p-1.5 rounded-lg text-charcoal-600 dark:text-silver-300 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-silver-100 dark:hover:bg-charcoal-700 transition-colors"
                                title="View student details & complaint history"
                              >
                                <Eye size={16} />
                              </button>

                              {/* Suspend / Reactivate */}
                              {isSuspended ? (
                                <button
                                  type="button"
                                  disabled={statusUpdatingId === student._id}
                                  onClick={() => handleToggleStatus(student, 'active')}
                                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors flex items-center gap-1"
                                  title="Reactivate student account"
                                >
                                  <UserCheck size={14} />
                                  <span>Reactivate</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={statusUpdatingId === student._id}
                                  onClick={() => handleToggleStatus(student, 'suspended')}
                                  className="px-2 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition-colors flex items-center gap-1"
                                  title="Suspend account to block login while preserving data"
                                >
                                  <Ban size={14} />
                                  <span>Suspend</span>
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(student)}
                                className="p-1.5 rounded-lg text-silver-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                title="Permanently delete student account"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: STUDENT DETAILS & COMPLAINT HISTORY MODAL */}
      {/* ======================================================== */}
      <AnimatePresence>
        {viewModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-charcoal-900 border border-silver-200 dark:border-charcoal-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-silver-200 dark:border-charcoal-700 flex items-center justify-between bg-silver-50/50 dark:bg-charcoal-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gold-500/30 via-silver-400/30 to-charcoal-700/50 text-charcoal-900 dark:text-gold-400 font-bold flex items-center justify-center text-sm border border-gold-500/40">
                    {selectedStudent.name ? selectedStudent.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-xs text-silver-500 dark:text-silver-400">
                      {selectedStudent.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="p-1.5 rounded-lg text-silver-400 hover:text-charcoal-700 dark:hover:text-silver-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Account Profile Grid */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-silver-500 mb-3">
                    Student Account Information
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-silver-50 dark:bg-charcoal-800/50 border border-silver-200 dark:border-charcoal-700 text-xs">
                    <div>
                      <span className="text-silver-400">Student ID / Reg:</span>
                      <p className="font-mono font-bold text-charcoal-900 dark:text-silver-100 mt-0.5">
                        {selectedStudent.studentId || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <span className="text-silver-400">Department / Course:</span>
                      <p className="font-semibold text-charcoal-900 dark:text-silver-100 mt-0.5">
                        {selectedStudent.department || 'General'}
                      </p>
                    </div>

                    <div>
                      <span className="text-silver-400">Account Status:</span>
                      <div className="mt-0.5">
                        {selectedStudent.status === 'suspended' || selectedStudent.isActive === false ? (
                          <Badge variant="warning">Suspended</Badge>
                        ) : selectedStudent.status === 'pending' ? (
                          <Badge variant="info">Pending</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-silver-400">Registration Date:</span>
                      <p className="font-semibold text-charcoal-900 dark:text-silver-100 mt-0.5">
                        {new Date(selectedStudent.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <span className="text-silver-400">Last Login:</span>
                      <p className="font-semibold text-charcoal-900 dark:text-silver-100 mt-0.5">
                        {selectedStudent.lastLogin
                          ? new Date(selectedStudent.lastLogin).toLocaleString()
                          : 'Never logged in'}
                      </p>
                    </div>

                    <div>
                      <span className="text-silver-400">Failed Login Attempts:</span>
                      <p
                        className={`font-semibold mt-0.5 ${
                          (selectedStudent.failedLoginAttempts || 0) >= 3
                            ? 'text-red-600 font-bold'
                            : 'text-charcoal-900 dark:text-silver-100'
                        }`}
                      >
                        {selectedStudent.failedLoginAttempts || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Account Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-silver-200 dark:border-charcoal-700 bg-silver-50/50 dark:bg-charcoal-800/30">
                  <div className="text-xs text-silver-500">
                    <span>Manage account state:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedStudent.status === 'suspended' || selectedStudent.isActive === false ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={statusUpdatingId === selectedStudent._id}
                        onClick={() => handleToggleStatus(selectedStudent, 'active')}
                        className="text-xs font-semibold text-emerald-600 border-emerald-500/40"
                      >
                        <UserCheck size={14} />
                        <span>Reactivate Account</span>
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={statusUpdatingId === selectedStudent._id}
                        onClick={() => handleToggleStatus(selectedStudent, 'suspended')}
                        className="text-xs font-semibold text-amber-600 border-amber-500/40"
                      >
                        <Ban size={14} />
                        <span>Suspend Account</span>
                      </Button>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenDelete(selectedStudent)}
                      className="text-xs font-semibold"
                    >
                      <Trash2 size={14} />
                      <span>Delete Account</span>
                    </Button>
                  </div>
                </div>

                {/* Relevant Complaint History */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-silver-500 flex items-center gap-1.5">
                      <FileText size={14} />
                      <span>Submitted Complaint History</span>
                    </h4>
                    <span className="text-xs text-silver-400 font-semibold">
                      Total: {studentDetails?.complaints?.length || 0}
                    </span>
                  </div>

                  {detailsLoading ? (
                    <Skeleton height="h-14" count={2} />
                  ) : !studentDetails?.complaints || studentDetails.complaints.length === 0 ? (
                    <div className="p-6 text-center text-silver-400 text-xs rounded-xl border border-dashed border-silver-200 dark:border-charcoal-700">
                      No complaints submitted by this student yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {studentDetails.complaints.map((comp) => (
                        <div
                          key={comp._id}
                          className="p-3 rounded-lg border border-silver-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-silver-600 dark:text-silver-300">
                                {comp.complaintId || comp._id.slice(-6).toUpperCase()}
                              </span>
                              <Badge
                                variant={
                                  comp.status === 'Resolved'
                                    ? 'success'
                                    : comp.status === 'In Progress'
                                    ? 'gold'
                                    : 'warning'
                                }
                              >
                                {comp.status}
                              </Badge>
                              <span className="text-[11px] text-silver-400">
                                {comp.category} • {comp.priority}
                              </span>
                            </div>
                            <h5 className="font-semibold text-charcoal-900 dark:text-silver-100">
                              {comp.title}
                            </h5>
                          </div>
                          <div className="text-right text-[11px] text-silver-400 flex-shrink-0">
                            {new Date(comp.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-silver-200 dark:border-charcoal-700 flex justify-end bg-silver-50/50 dark:bg-charcoal-800/40">
                <Button variant="ghost" size="sm" onClick={() => setViewModalOpen(false)}>
                  <span>Close Details</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL 2: DELETE STUDENT ACCOUNT CONFIRMATION DIALOG */}
      {/* ======================================================== */}
      <AnimatePresence>
        {deleteModalOpen && studentToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-charcoal-900 border border-silver-200 dark:border-charcoal-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 flex-shrink-0">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">
                    Delete Student Account?
                  </h3>
                  <p className="text-xs text-silver-500">
                    Target: <strong>{studentToDelete.name}</strong> ({studentToDelete.email})
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-charcoal-700 dark:text-silver-300">
                <p className="font-semibold text-red-600 dark:text-red-400">
                  This will permanently remove the student's account and cannot be undone.
                </p>
                <p>Are you sure you want to continue?</p>

                <div className="p-3 rounded-xl bg-silver-50 dark:bg-charcoal-800/60 border border-silver-200 dark:border-charcoal-700 text-xs text-silver-500 dark:text-silver-400">
                  <strong className="text-charcoal-900 dark:text-silver-200">Institutional Preservation:</strong>{' '}
                  Existing complaint records submitted by this student will be retained and anonymized to preserve compliance and administrative audit trails.
                </div>
              </div>

              {/* Action Buttons: [Cancel] [Delete Account] */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  disabled={isDeleting}
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setStudentToDelete(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  isLoading={isDeleting}
                  onClick={handleConfirmDelete}
                  className="font-semibold shadow-md"
                >
                  Delete Account
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
