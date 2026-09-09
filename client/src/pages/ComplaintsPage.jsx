import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  ExternalLink,
  Bot,
  CheckCircle2,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { complaintAPI } from '../services/api';
import { Button, Badge, Modal, EmptyState, Skeleton } from '../components/ui';
import { useToast } from '../components/Toast';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Submitted', value: 'Submitted' },
  { label: 'Under Review', value: 'Under Review' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' },
];

export const ComplaintsPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await complaintAPI.getMy(params);
      if (res.data?.data) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      toast.error('Failed to load your complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
            <span>🔵</span>
            <span>Submitted</span>
          </span>
        );
      case 'Viewed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
            <span>👁️</span>
            <span>Viewed by Administrator</span>
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
            <span>🟠</span>
            <span>Under Review</span>
          </span>
        );
      case 'In Progress':
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
            <span>⚙️</span>
            <span>In Progress</span>
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
            <span>🟢</span>
            <span>Resolved</span>
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
            <span>🔒</span>
            <span>Closed</span>
          </span>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container-max py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
            <FileText className="text-gold-500" />
            My Complaints
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Track all your filed grievances and check real-time resolution status
          </p>
        </div>

        <Button
          variant="gold"
          size="md"
          onClick={() => navigate('/student/complaints/new')}
          className="self-start sm:self-center"
        >
          <PlusCircle size={18} />
          <span>New Complaint</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#B8892E] dark:bg-[#C89B3C] text-white shadow-sm'
                    : 'bg-[#F0F1F3] dark:bg-[#252C36] text-[#6B7280] dark:text-[#D1D5DB] hover:bg-[#E2E5E9] dark:hover:bg-[#343A46]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3 text-[#6B7280] dark:text-[#9CA3AF]" size={18} />
            <input
              id="search-complaints"
              name="searchQuery"
              aria-label="Search complaints"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search complaints by ID, title, or keywords..."
              className="input-field pl-10"
            />
          </div>
          <Button type="submit" variant="secondary" size="md">
            <span>Search</span>
          </Button>
          {(searchQuery || statusFilter) && (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
            >
              Reset
            </Button>
          )}
        </form>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton height="h-28" count={3} />
        </div>
      ) : complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((c) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.005 }}
              className="card p-5 hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-grow min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#F0F1F3] dark:bg-[#252C36] text-[#1F2937] dark:text-[#D1D5DB] border border-[#E2E5E9] dark:border-[#343A46]">
                    {c.complaintId || c._id.slice(-6).toUpperCase()}
                  </span>
                  <Badge variant={getPriorityBadgeVariant(c.priority)}>
                    {c.priority}
                  </Badge>
                  {getStatusBadge(c.status)}
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-base text-[#1F2937] dark:text-[#F8FAFC]">
                  {c.title}
                </h3>

                <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] line-clamp-2">
                  {c.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#6B7280] dark:text-[#9CA3AF] pt-1">
                  <span>Category: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{c.category}</strong></span>
                  {c.department?.name && (
                    <span className="flex items-center gap-1">
                      <Building2 size={12} /> {c.department.name}
                    </span>
                  )}
                  {c.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {c.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedComplaint(c)}
                  className="border border-[#E2E5E9] dark:border-[#343A46]"
                >
                  <span>View Details</span>
                  <ExternalLink size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="card p-12">
          <EmptyState
            icon={FileText}
            title={
              statusFilter || searchQuery
                ? 'No matching complaints found'
                : "You haven't submitted any complaints yet"
            }
            description={
              statusFilter || searchQuery
                ? 'Try changing your search query or removing status filters.'
                : 'Create your first complaint to report an issue with campus facilities or academics.'
            }
            action={
              statusFilter || searchQuery ? (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate('/student/complaints/new')}
                >
                  <PlusCircle size={18} />
                  <span>New Complaint</span>
                </Button>
              )
            }
          />
        </div>
      )}

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          title={`Complaint Details — ${selectedComplaint.complaintId || selectedComplaint._id.slice(-6).toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#E2E5E9] dark:border-[#343A46]">
              {getStatusBadge(selectedComplaint.status)}
              <Badge variant={getPriorityBadgeVariant(selectedComplaint.priority)}>
                {selectedComplaint.priority} Priority
              </Badge>
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Category: <strong className="text-[#1F2937] dark:text-[#F8FAFC]">{selectedComplaint.category}</strong>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-lg text-[#1F2937] dark:text-[#F8FAFC]">
                {selectedComplaint.title}
              </h3>
              <p className="text-sm text-[#4B5563] dark:text-[#D1D5DB] mt-2 whitespace-pre-wrap">
                {selectedComplaint.description}
              </p>
            </div>

            {selectedComplaint.location && (
              <div className="p-2.5 bg-[#F0F1F3] dark:bg-[#252C36] rounded-lg text-xs text-[#1F2937] dark:text-[#D1D5DB] border border-[#E2E5E9] dark:border-[#343A46]">
                📍 <strong>Location:</strong> {selectedComplaint.location}
              </div>
            )}

            {selectedComplaint.aiAnalysis?.summary && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                  <Bot size={14} /> AI Analysis Summary:
                </span>
                <p className="text-blue-800 dark:text-blue-300">
                  {selectedComplaint.aiAnalysis.summary}
                </p>
              </div>
            )}

            {selectedComplaint.resolution?.resolutionText && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Resolution Notes:
                </span>
                <p className="text-emerald-800 dark:text-emerald-300">
                  {selectedComplaint.resolution.resolutionText}
                </p>
              </div>
            )}

            {selectedComplaint.adminRemarks && selectedComplaint.adminRemarks.length > 0 && (
              <div className="pt-2">
                <h4 className="font-semibold text-sm mb-2 text-[#1F2937] dark:text-[#F8FAFC]">Administrator Remarks</h4>
                <div className="space-y-2">
                  {selectedComplaint.adminRemarks.map((rem, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F0F1F3] dark:bg-[#252C36] rounded-lg text-xs space-y-1 border border-[#E2E5E9] dark:border-[#343A46]"
                    >
                      <div className="flex justify-between text-[#6B7280] dark:text-[#9CA3AF]">
                        <span>Admin Remark</span>
                        <span>{new Date(rem.addedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[#1F2937] dark:text-[#D1D5DB] font-medium">
                        "{rem.remark}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedComplaint.statusHistory && selectedComplaint.statusHistory.length > 0 && (
              <div className="pt-2">
                <h4 className="font-semibold text-sm mb-3 text-[#1F2937] dark:text-[#F8FAFC]">Status Timeline</h4>
                <div className="space-y-3 pl-2 border-l-2 border-[#B8892E] dark:border-[#C89B3C]">
                  {selectedComplaint.statusHistory.map((step, idx) => (
                    <div key={idx} className="relative pl-4">
                      <div className="absolute -left-[1.3rem] top-1 w-3 h-3 rounded-full bg-[#B8892E] dark:bg-[#C89B3C] ring-4 ring-white dark:ring-[#1B2028]" />
                      <div className="font-medium text-sm text-[#1F2937] dark:text-[#F8FAFC]">
                        {step.status}
                      </div>
                      <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        {new Date(step.timestamp).toLocaleString()}
                      </div>
                      {step.remark && (
                        <p className="text-xs text-[#4B5563] dark:text-[#D1D5DB] mt-0.5">
                          "{step.remark}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#E2E5E9] dark:border-[#343A46] flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
