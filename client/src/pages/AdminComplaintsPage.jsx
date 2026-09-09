import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Building2,
  MapPin,
  Calendar,
  MessageSquare,
  FileText,
  Shield,
  Send,
  Sparkles,
  ArrowRight,
  X,
  RefreshCw,
  Tag,
  Check,
} from 'lucide-react';
import { complaintAPI, departmentAPI } from '../services/api';
import { Button, Badge, Skeleton, Input, Textarea } from '../components/ui';
import { toast } from '../components/Toast';

export const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Status update modal & state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('Under Review');
  const [statusRemark, setStatusRemark] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [resolving, setResolving] = useState(false);

  // Remark input state
  const [newRemark, setNewRemark] = useState('');
  const [addingRemark, setAddingRemark] = useState(false);

  // Departments for assignment
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();

      const res = await complaintAPI.getAll(params);
      if (res.data?.data) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      if (res.data?.data) setDepartments(res.data.data);
    } catch (err) {
      console.warn('Could not load departments:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, priorityFilter]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Open complaint details and mark as viewed
  const handleOpenComplaint = async (complaintId) => {
    setModalLoading(true);
    try {
      const res = await complaintAPI.getById(complaintId);
      if (res.data?.data) {
        const comp = res.data.data;
        setSelectedComplaint(comp);

        // If not already marked as viewed, trigger markAsViewed
        if (!comp.isViewedByAdmin) {
          try {
            const viewedRes = await complaintAPI.markAsViewed(complaintId);
            if (viewedRes.data?.data) {
              setSelectedComplaint(viewedRes.data.data);
              // Update local complaint list
              setComplaints((prev) =>
                prev.map((c) =>
                  c._id === complaintId
                    ? { ...c, isViewedByAdmin: true, status: c.status === 'Submitted' ? 'Viewed' : c.status }
                    : c
                )
              );
              toast.success('Complaint marked as Viewed. Student has been notified.');
            }
          } catch (vErr) {
            console.warn('Auto mark as viewed error:', vErr);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching complaint details:', err);
      toast.error('Failed to load complaint details');
    } finally {
      setModalLoading(false);
    }
  };

  // Explicit mark as viewed handler
  const handleExplicitMarkViewed = async () => {
    if (!selectedComplaint) return;
    try {
      const res = await complaintAPI.markAsViewed(selectedComplaint._id);
      if (res.data?.data) {
        setSelectedComplaint(res.data.data);
        setComplaints((prev) =>
          prev.map((c) => (c._id === selectedComplaint._id ? res.data.data : c))
        );
        toast.success('Complaint marked as Viewed. Student notified.');
      }
    } catch (err) {
      toast.error('Failed to mark as viewed');
    }
  };

  // Handle status update
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdatingStatus(true);
    try {
      const res = await complaintAPI.updateStatus(selectedComplaint._id, {
        status: newStatus,
        remark: statusRemark,
      });
      if (res.data?.data) {
        setSelectedComplaint(res.data.data);
        setComplaints((prev) =>
          prev.map((c) => (c._id === selectedComplaint._id ? res.data.data : c))
        );
        toast.success(`Status updated to "${newStatus}" and student notified.`);
        setShowStatusModal(false);
        setStatusRemark('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle resolve complaint
  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    if (!resolutionText.trim()) {
      toast.error('Please provide a resolution explanation.');
      return;
    }
    setResolving(true);
    try {
      const res = await complaintAPI.resolve(selectedComplaint._id, {
        resolutionText: resolutionText.trim(),
      });
      if (res.data?.data) {
        setSelectedComplaint(res.data.data);
        setComplaints((prev) =>
          prev.map((c) => (c._id === selectedComplaint._id ? res.data.data : c))
        );
        toast.success('Complaint marked as Resolved! Notification sent to student.');
        setShowResolveModal(false);
        setResolutionText('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setResolving(false);
    }
  };

  // Handle adding admin remark
  const handleAddRemarkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !newRemark.trim()) return;
    setAddingRemark(true);
    try {
      const res = await complaintAPI.addRemark(selectedComplaint._id, {
        remark: newRemark.trim(),
      });
      if (res.data?.data) {
        setSelectedComplaint(res.data.data);
        setComplaints((prev) =>
          prev.map((c) => (c._id === selectedComplaint._id ? res.data.data : c))
        );
        toast.success('Remark added to timeline and student notified.');
        setNewRemark('');
      }
    } catch (err) {
      toast.error('Failed to add remark');
    } finally {
      setAddingRemark(false);
    }
  };

  // Department assignment
  const handleAssignDepartment = async (deptId) => {
    if (!selectedComplaint || !deptId) return;
    try {
      const res = await complaintAPI.assignDepartment(selectedComplaint._id, {
        departmentId: deptId,
      });
      if (res.data?.data) {
        setSelectedComplaint(res.data.data);
        setComplaints((prev) =>
          prev.map((c) => (c._id === selectedComplaint._id ? res.data.data : c))
        );
        toast.success('Department assigned and student notified.');
      }
    } catch (err) {
      toast.error('Failed to assign department');
    }
  };

  // Helper status badge with visual icons
  const getStatusBadge = (status, isViewed) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
            <span>🔵</span>
            <span>Submitted</span>
          </span>
        );
      case 'Viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
            <span>👁️</span>
            <span>Viewed by Admin</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
            <span>🟠</span>
            <span>Under Review</span>
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
            <span>⚙️</span>
            <span>In Progress</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
            <span>🟢</span>
            <span>Resolved</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            <span>🔒</span>
            <span>Closed</span>
          </span>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical':
        return <Badge variant="danger">Critical</Badge>;
      case 'High':
        return <Badge variant="danger">High</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      case 'Low':
        return <Badge variant="info">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const statuses = ['All', 'Submitted', 'Viewed', 'Under Review', 'In Progress', 'Resolved', 'Closed'];

  return (
    <div className="container-max py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 text-primary text-xs font-bold mb-2">
            <Shield size={14} />
            <span>Administrative Grievance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Campus Complaints & Resolution
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Inspect student submissions, mark complaints as viewed, add remarks, and log official resolutions.
          </p>
        </div>

        <Button variant="ghost" size="sm" onClick={fetchComplaints}>
          <RefreshCw size={14} className="mr-1.5" />
          <span>Refresh List</span>
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-700">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="admin-complaints-search"
              name="searchQuery"
              aria-label="Search complaints by student, ID, or keywords"
              type="text"
              placeholder="Search by student, ID, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchComplaints()}
              className="input pl-9 text-xs w-full bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC] border border-[#EBE8DF] dark:border-[#232B3B]"
            />
          </div>

          <select
            id="admin-priority-filter"
            name="priorityFilter"
            aria-label="Filter complaints by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input text-xs bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC] border border-[#EBE8DF] dark:border-[#232B3B] cursor-pointer"
          >
            <option value="All" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">All Priorities</option>
            <option value="Critical" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Critical</option>
            <option value="High" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">High</option>
            <option value="Medium" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Medium</option>
            <option value="Low" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Low</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchComplaints} className="text-xs font-semibold">
            <Filter size={14} className="mr-1.5" />
            Apply Search
          </Button>
        </div>
      </div>

      {/* Complaints List Table / Grid */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton height="h-20" count={4} />
        </div>
      ) : complaints.length > 0 ? (
        <div className="space-y-3">
          {complaints.map((comp) => (
            <div
              key={comp._id}
              onClick={() => handleOpenComplaint(comp._id)}
              className={`card p-4 sm:p-5 hover:border-primary cursor-pointer transition-all border ${
                !comp.isViewedByAdmin ? 'border-l-4 border-l-blue-500 bg-blue-50/20 dark:bg-blue-950/10' : ''
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="space-y-2 flex-grow">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {comp.complaintId || comp._id.slice(-6).toUpperCase()}
                    </span>
                    {getStatusBadge(comp.status, comp.isViewedByAdmin)}
                    {getPriorityBadge(comp.priority)}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      {comp.category}
                    </span>
                    {!comp.isViewedByAdmin && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 animate-pulse">
                        NEW / UNREAD
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {comp.title}
                  </h3>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      <strong>{comp.student?.name || 'Student'}</strong> ({comp.student?.studentId || comp.student?.email || 'N/A'})
                    </span>
                    {comp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {comp.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(comp.createdAt).toLocaleDateString()} at{' '}
                      {new Date(comp.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-2 flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenComplaint(comp._id);
                    }}
                    className="text-xs font-semibold"
                  >
                    <Eye size={14} className="mr-1.5" />
                    <span>View & Manage</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center space-y-3">
          <FileText size={36} className="mx-auto text-gray-300 dark:text-gray-600" />
          <h3 className="font-bold text-base text-gray-700 dark:text-gray-300">
            No complaints found
          </h3>
          <p className="text-xs text-gray-500">
            No records matched your selected status or search filter.
          </p>
        </div>
      )}

      {/* COMPLAINT DETAIL & RESOLUTION MODAL */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141A26] rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-[#EBE8DF] dark:border-[#1E2738] max-h-[90vh] overflow-y-auto space-y-6 text-left"
            >
              {/* Modal Top Bar */}
              <div className="flex items-start justify-between border-b border-[#EBE8DF] dark:border-[#1E2738] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                      {selectedComplaint.complaintId || selectedComplaint._id}
                    </span>
                    {getStatusBadge(selectedComplaint.status, selectedComplaint.isViewedByAdmin)}
                    {getPriorityBadge(selectedComplaint.priority)}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedComplaint.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[#F7F5F0] dark:hover:bg-[#1A2230]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Resolution Banner if already resolved */}
              {selectedComplaint.status === 'Resolved' && selectedComplaint.resolution && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                    <CheckCircle2 size={16} />
                    <span>Official Resolution Details</span>
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    {selectedComplaint.resolution.resolutionText}
                  </p>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 pt-1">
                    Resolved by {selectedComplaint.resolution.resolvedBy?.name || 'Administrator'} on{' '}
                    {new Date(selectedComplaint.resolvedAt || selectedComplaint.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Main Information Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left 2 Cols: Complaint Info & Actions */}
                <div className="md:col-span-2 space-y-5">
                  {/* Description Box */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Complaint Description
                    </h4>
                    <div className="p-4 rounded-xl bg-[#F7F5F0] dark:bg-[#1A2230] border border-[#EBE8DF] dark:border-[#232B3B] text-sm text-[#1F2937] dark:text-[#F8FAFC] leading-relaxed whitespace-pre-wrap">
                      {selectedComplaint.description}
                    </div>
                  </div>

                  {/* Location & Meta */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#F7F5F0] dark:bg-[#1A2230] border border-[#EBE8DF] dark:border-[#232B3B] text-xs">
                    <div>
                      <span className="text-gray-400 block font-medium">Campus Location:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-primary" />
                        {selectedComplaint.location || 'Not specified'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Assigned Department:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 mt-0.5">
                        <Building2 size={12} className="text-primary" />
                        {selectedComplaint.department?.name || 'Unassigned'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Date Submitted:</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 mt-0.5 block">
                        {new Date(selectedComplaint.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block font-medium">Admin View Status:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                        <Eye size={12} />
                        {selectedComplaint.isViewedByAdmin ? 'Viewed by Administration' : 'Not Viewed Yet'}
                      </span>
                    </div>
                  </div>

                  {/* AI Analysis (if available) */}
                  {selectedComplaint.aiAnalysis && (
                    <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/80 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-200">
                        <Sparkles size={14} className="text-purple-600" />
                        <span>AI Assistant Analysis</span>
                      </div>
                      <p className="text-purple-900 dark:text-purple-200">
                        Recommended Dept: <strong>{selectedComplaint.aiAnalysis.recommendedDepartment || 'N/A'}</strong> • Suggested Priority: <strong>{selectedComplaint.aiAnalysis.priority || 'Medium'}</strong>
                      </p>
                    </div>
                  )}

                  {/* Administrator Action Bar */}
                  <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-700/50 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                      Administrative Actions
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {/* Mark as Viewed button if not yet viewed */}
                      {!selectedComplaint.isViewedByAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleExplicitMarkViewed}
                          className="bg-white dark:bg-gray-800 text-purple-600 text-xs font-bold shadow-xs"
                        >
                          <Eye size={14} className="mr-1.5" />
                          Mark as Viewed
                        </Button>
                      )}

                      {/* Update Status Button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setNewStatus(selectedComplaint.status);
                          setShowStatusModal(true);
                        }}
                        className="text-xs font-bold"
                      >
                        <Clock size={14} className="mr-1.5" />
                        Update Status
                      </Button>

                      {/* Prominent Mark as Resolved Button */}
                      {selectedComplaint.status !== 'Resolved' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowResolveModal(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                        >
                          <CheckCircle2 size={14} className="mr-1.5" />
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Add Administrative Remark Box */}
                  <form onSubmit={handleAddRemarkSubmit} className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Add Progress Remark / Update
                    </h4>
                    <div className="flex gap-2">
                      <input
                        id="admin-remark-input"
                        name="remark"
                        aria-label="Add progress remark or update"
                        type="text"
                        placeholder="e.g. Complaint forwarded to maintenance team; inspection scheduled..."
                        value={newRemark}
                        onChange={(e) => setNewRemark(e.target.value)}
                        className="input text-xs flex-grow bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC] border border-[#EBE8DF] dark:border-[#232B3B]"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        disabled={addingRemark || !newRemark.trim()}
                        className="text-xs font-semibold whitespace-nowrap"
                      >
                        <Send size={12} className="mr-1.5" />
                        Add Remark
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Right Col: Student Details Card & Two-Way Timeline */}
                <div className="space-y-5">
                  {/* Student Details Card */}
                  <div className="card p-4 space-y-3 bg-[#F7F5F0] dark:bg-[#1A2230] border border-[#EBE8DF] dark:border-[#232B3B]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <User size={14} />
                      Student Information
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-400 block">Full Name:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 capitalize">
                          {selectedComplaint.student?.name || selectedComplaint.studentName || 'Student'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Email Address:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {selectedComplaint.student?.email || selectedComplaint.studentEmail || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Student Roll / ID:</span>
                        <span className="font-bold font-mono text-gray-800 dark:text-gray-200">
                          {selectedComplaint.student?.studentId || 'Not registered'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Department / Branch:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">
                          {selectedComplaint.student?.department || 'General Student'}
                        </span>
                      </div>
                      {selectedComplaint.student?.phone && (
                        <div>
                          <span className="text-gray-400 block">Phone Number:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {selectedComplaint.student.phone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Two-Way Resolution Timeline History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Clock size={14} />
                      Lifecycle & Audit Timeline
                    </h4>

                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                      {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 ? (
                        selectedComplaint.statusHistory.map((h, hIdx) => (
                          <div key={hIdx} className="flex gap-2.5 text-xs">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5 ring-4 ring-primary/20" />
                            <div className="space-y-0.5">
                              <div className="font-bold text-gray-800 dark:text-gray-200">
                                {h.status}
                              </div>
                              {h.remark && (
                                <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                                  {h.remark}
                                </p>
                              )}
                              <span className="text-[10px] text-gray-400 block">
                                {new Date(h.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          No history logged yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPDATE STATUS MODAL */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141A26] rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#EBE8DF] dark:border-[#1E2738] space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">
                  Update Complaint Status
                </h3>
                <button onClick={() => setShowStatusModal(false)}>
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-left">
                <div>
                  <label htmlFor="admin-status-select" className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Select New Status
                  </label>
                  <select
                    id="admin-status-select"
                    name="newStatus"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input text-xs w-full bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC] border border-[#EBE8DF] dark:border-[#232B3B] cursor-pointer"
                  >
                    <option value="Viewed" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Viewed by Administrator</option>
                    <option value="Under Review" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Under Review</option>
                    <option value="In Progress" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">In Progress</option>
                    <option value="Resolved" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Resolved</option>
                    <option value="Closed" className="bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC]">Closed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-status-remark" className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Status Remark / Action Note (Optional)
                  </label>
                  <Textarea
                    id="admin-status-remark"
                    name="statusRemark"
                    placeholder="Enter reason for status change or update for the student..."
                    rows={3}
                    value={statusRemark}
                    onChange={(e) => setStatusRemark(e.target.value)}
                    className="text-xs bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC] border border-[#EBE8DF] dark:border-[#232B3B]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStatusModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={updatingStatus}>
                    {updatingStatus ? 'Updating...' : 'Confirm Update'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESOLUTION MODAL */}
      <AnimatePresence>
        {showResolveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141A26] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#EBE8DF] dark:border-[#1E2738] space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 size={18} />
                  <span>Resolve Complaint</span>
                </div>
                <button onClick={() => setShowResolveModal(false)}>
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <p className="text-xs text-gray-500 text-left">
                Please provide an explanation of the actions taken to resolve this student grievance. This note will be visible to the student and sent in a resolution notification.
              </p>

              <form onSubmit={handleResolveSubmit} className="space-y-4 text-left">
                <div>
                  <label htmlFor="admin-resolution-details" className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block">
                    Resolution Details *
                  </label>
                  <Textarea
                    id="admin-resolution-details"
                    name="resolutionDetails"
                    placeholder="e.g. The damaged classroom fan has been replaced by the maintenance department, and power supply has been verified."
                    rows={4}
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    required
                    className="text-xs bg-white dark:bg-[#151B26] text-[#1F2937] dark:text-[#F8FAFC] border border-[#EBE8DF] dark:border-[#232B3B]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowResolveModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={resolving || !resolutionText.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {resolving ? 'Submitting Resolution...' : 'Mark as Resolved'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
