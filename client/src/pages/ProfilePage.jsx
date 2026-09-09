import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Hash,
  Building2,
  Phone,
  Shield,
  Calendar,
  Edit2,
  Save,
  X,
  CheckCircle2,
  FileText,
  AlertCircle,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, dashboardAPI } from '../services/api';
import { Button, Input, Badge, Card, Skeleton } from '../components/ui';
import { useToast } from '../components/Toast';

export const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  // Account Deletion Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
  });

  const fetchProfileAndStats = async () => {
    setLoading(true);
    try {
      const [profileRes, dashRes] = await Promise.all([
        userAPI.getProfile(),
        dashboardAPI.getStudentDashboard().catch(() => ({ data: { data: {} } })),
      ]);

      if (profileRes.data?.data) {
        const p = profileRes.data.data;
        setProfile(p);
        setFormData({
          name: p.name || '',
          phone: p.phone || '',
          department: p.department || '',
        });
      }

      if (dashRes.data?.data?.statistics) {
        const s = dashRes.data.data.statistics;
        setStats({
          total: s.totalComplaints || 0,
          pending: (s.submitted || 0) + (s.underReview || 0),
          resolved: (s.resolved || 0) + (s.closed || 0),
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      toast.error('Unable to load profile information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const res = await userAPI.updateProfile(formData);
      if (res.data?.data) {
        const updated = res.data.data;
        setProfile(updated);
        updateUser({
          name: updated.name,
          phone: updated.phone,
          department: updated.department,
        });
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteError('Please type DELETE in uppercase to confirm permanent account deletion.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      await userAPI.deleteAccount({ confirmation: 'DELETE' });
      setDeleteModalOpen(false);
      await logout();
      navigate('/');
      toast.success('✅ Your GrievDesk account has been permanently deleted.');
    } catch (err) {
      console.error('Account deletion error:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete account. Please try again.');
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-max py-8 px-4 sm:px-6 max-w-3xl space-y-6">
        <Skeleton height="h-32" count={1} />
        <Skeleton height="h-64" count={1} />
      </div>
    );
  }

  const studentName = profile?.name || user?.name || 'Student';
  const studentEmail = profile?.email || user?.email || 'N/A';
  const studentId = profile?.studentId || user?.studentId || 'N/A';
  const department = profile?.department || 'Not Assigned';
  const phone = profile?.phone || 'Not Provided';

  return (
    <div className="container-max py-8 px-4 sm:px-6 max-w-4xl space-y-6">
      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 sm:p-8 bg-gradient-to-r from-white via-[#F9FAFB] to-white dark:from-[#1B2028] dark:via-[#202630] dark:to-[#1B2028] text-[#1F2937] dark:text-[#F8FAFC] relative overflow-hidden border border-[#E2E5E9] dark:border-gold-500/30 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F0F1F3] dark:bg-[#252C36] text-[#B8892E] dark:text-[#E0B85C] flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-md border-4 border-[#E2E5E9] dark:border-gold-500/30">
            {studentName.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-2 text-center sm:text-left flex-grow">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2937] dark:text-[#F8FAFC]">
                {studentName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-gold-500/15 text-[#B8892E] dark:text-gold-300 border border-amber-200 dark:border-gold-500/30 text-xs font-semibold uppercase tracking-wider">
                {profile?.role || user?.role || 'Student'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Active Account
              </span>
            </div>

            <p className="text-[#6B7280] dark:text-[#D1D5DB] text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <Mail size={14} />
              <span>{studentEmail}</span>
            </p>

            {studentId !== 'N/A' && (
              <p className="text-[#6B7280] dark:text-[#D1D5DB] text-sm flex items-center justify-center sm:justify-start gap-1.5">
                <Hash size={14} />
                <span>Student ID: {studentId}</span>
              </p>
            )}
          </div>

          <div className="sm:self-start">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="font-semibold"
            >
              {isEditing ? <X size={16} /> : <Edit2 size={16} />}
              <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
            </Button>
          </div>
        </div>

        {/* Decorative subtle glow */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-gold-500/10 rounded-full blur-2xl"></div>
      </motion.div>

      {/* Profile Overview Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">
            {stats.total}
          </div>
          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Total Complaints
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
          </div>
          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Pending Review
          </div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.resolved}
          </div>
          <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
            Resolved
          </div>
        </div>
      </div>

      {/* Edit Mode or Details Card */}
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6 sm:p-8 space-y-6"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Edit2 size={18} className="text-primary" />
            Edit Profile Details
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              id="profile-name"
              label="Full Name"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium mb-1">Email Address</label>
              <input
                id="profile-email"
                name="email"
                type="email"
                value={studentEmail}
                disabled
                className="input-field opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Email address cannot be modified as it is tied to your student account login.
              </span>
            </div>

            <Input
              id="profile-phone"
              label="Phone Number"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="e.g. +91 9876543210"
            />

            <Input
              id="profile-department"
              label="Department / Course"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g. Computer Science & Engineering"
            />

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" isLoading={saving}>
                <Save size={16} />
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-4 border-[#E2E5E9] dark:border-[#343A46]">
            <h2 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              <User size={18} className="text-gold-500" />
              Account Details
            </h2>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Student Profile Information</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <User size={18} />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Full Name</div>
                <div className="font-semibold text-[#1F2937] dark:text-[#F8FAFC] mt-0.5">
                  {studentName}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Email Address</div>
                <div className="font-semibold text-[#1F2937] dark:text-[#F8FAFC] mt-0.5 break-all">
                  {studentEmail}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                <Hash size={18} />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Student ID</div>
                <div className="font-semibold font-mono text-[#1F2937] dark:text-[#F8FAFC] mt-0.5">
                  {studentId}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                <Building2 size={18} />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Department / Major</div>
                <div className="font-semibold text-[#1F2937] dark:text-[#F8FAFC] mt-0.5">
                  {department}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-[#B8892E] dark:text-[#E0B85C]">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Contact Number</div>
                <div className="font-semibold text-[#1F2937] dark:text-[#F8FAFC] mt-0.5">
                  {phone}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">Account Authorization</div>
                <div className="font-semibold text-[#1F2937] dark:text-[#F8FAFC] mt-0.5">
                  Verified Student (Campus Member)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DANGER ZONE: PERMANENT ACCOUNT DELETION */}
      <div className="card border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/20 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
              <AlertTriangle size={18} />
              <h4>Danger Zone • Permanent Account Deletion</h4>
            </div>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-silver-300 max-w-xl">
              Permanently delete your registered GrievDesk student account. Your personal identification will be erased.
              Submitted grievances will be anonymized to preserve official university audit and resolution compliance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteConfirmText('');
              setDeleteError('');
              setDeleteModalOpen(true);
            }}
            className="btn bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all flex-shrink-0"
          >
            <Trash2 size={16} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL: DELETE ACCOUNT */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#171B22] border border-red-200 dark:border-red-900/50 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800/40">
                  <Trash2 size={24} />
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="p-1 rounded-lg text-silver-400 hover:text-charcoal-800 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-[#171B22] dark:text-white">
                  Delete your account?
                </h3>
                <p className="text-xs sm:text-sm text-[#5F6875] dark:text-[#CBD1D6] leading-relaxed">
                  This action will permanently delete your account and cannot be undone.
                  Your submitted complaint history will be preserved as anonymized records for institutional compliance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 space-y-1.5">
                <p className="font-bold">
                  Please type <span className="font-mono underline font-extrabold">DELETE</span> to confirm permanent removal:
                </p>
                <input
                  id="delete-confirm-input"
                  name="deleteConfirmation"
                  aria-label="Type DELETE to confirm permanent removal"
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    setDeleteError('');
                  }}
                  placeholder="Type DELETE..."
                  className="w-full px-3 py-2 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-[#21262F] text-sm font-mono text-[#171B22] dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {deleteError && (
                  <p className="text-red-600 dark:text-red-400 font-semibold pt-1">{deleteError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="btn bg-[#EEF1F2] hover:bg-[#E2E6E9] dark:bg-[#2B3038] dark:hover:bg-[#343B45] text-[#171B22] dark:text-white text-xs sm:text-sm px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText.trim() !== 'DELETE' || isDeleting}
                  className="btn bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-md shadow-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <span>Deleting...</span>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      <span>Delete Account</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
