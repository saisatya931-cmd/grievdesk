import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  Sparkles,
  Paperclip,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  MapPin,
  Tag,
  AlertTriangle,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import { Button, Input, Textarea, Select } from '../components/ui';
import { complaintAPI, departmentAPI, aiAPI } from '../services/api';
import { useToast } from '../components/Toast';

const CATEGORIES = [
  { value: 'Academic', label: 'Academic & Curriculum' },
  { value: 'Examination', label: 'Examination & Evaluation' },
  { value: 'Faculty', label: 'Faculty & Instruction' },
  { value: 'Hostel', label: 'Hostel & Residential' },
  { value: 'Canteen', label: 'Canteen & Mess' },
  { value: 'Transport', label: 'Campus Transport' },
  { value: 'Library', label: 'Library & Reading Rooms' },
  { value: 'Infrastructure', label: 'Campus Infrastructure & Maintenance' },
  { value: 'Laboratory', label: 'Laboratory & Equipment' },
  { value: 'Fees', label: 'Fees & Accounts' },
  { value: 'Scholarship', label: 'Scholarship & Financial Aid' },
  { value: 'IT/Technical', label: 'IT, Wi-Fi & Software Services' },
  { value: 'Administration', label: 'General Administration' },
  { value: 'Other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'Low', label: 'Low', color: 'border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-900/30' },
  { value: 'Medium', label: 'Medium', color: 'border-yellow-400 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/30' },
  { value: 'High', label: 'High', color: 'border-orange-400 text-orange-700 bg-orange-50 dark:bg-orange-900/30' },
  { value: 'Critical', label: 'Critical', color: 'border-red-500 text-red-700 bg-red-50 dark:bg-red-900/30' },
];

export const NewComplaintPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'Medium',
    department: '',
    location: '',
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentAPI.getAll();
        if (res.data?.data && res.data.data.length > 0) {
          setDepartments(res.data.data);
        }
      } catch (err) {
        console.warn('Could not load departments from API:', err);
      } finally {
        setLoadingDepts(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePrioritySelect = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size cannot exceed 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // AI Assistance feature
  const handleAIAnalyze = async () => {
    if (!formData.title.trim() && !formData.description.trim()) {
      toast.error('Please enter a title and description before analyzing with AI.');
      return;
    }

    setAnalyzingAI(true);
    setAiSuggestion(null);

    try {
      const res = await aiAPI.analyze({
        title: formData.title || 'Campus grievance',
        description: formData.description || formData.title,
      });

      if (res.data?.data) {
        const analysis = res.data.data;
        setAiSuggestion(analysis);

        // Auto-apply category and priority if suggested
        if (analysis.category && CATEGORIES.some((c) => c.value === analysis.category)) {
          setFormData((prev) => ({
            ...prev,
            category: analysis.category,
            priority: analysis.priority || prev.priority,
          }));
        }

        // Try to match recommended department
        if (analysis.recommendedDepartment && departments.length > 0) {
          const matchedDept = departments.find((d) =>
            d.name.toLowerCase().includes(analysis.recommendedDepartment.toLowerCase())
          );
          if (matchedDept) {
            setFormData((prev) => ({ ...prev, department: matchedDept._id }));
          }
        }

        toast.success('AI suggestions applied to category and priority!');
      }
    } catch (err) {
      console.error('AI analyze error:', err);
      toast.error('AI Assistant is currently unavailable. Please fill the fields manually.');
    } finally {
      setAnalyzingAI(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Complaint title is required.';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a complaint category.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a detailed description.';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        priority: formData.priority,
        department: formData.department || null,
        location: formData.location.trim() || null,
        attachments: selectedFile
          ? [
              {
                filename: selectedFile.name,
                originalName: selectedFile.name,
                size: selectedFile.size,
                mimeType: selectedFile.type,
              },
            ]
          : [],
      };

      const res = await complaintAPI.create(payload);
      const createdId = res.data?.data?.complaintId || 'COMP';

      toast.success(`Complaint registered successfully! ID: ${createdId}`);
      navigate('/student/complaints');
    } catch (err) {
      console.error('Complaint submission error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit complaint';
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-max py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
      {/* Back button & page header */}
      <div className="mb-6 space-y-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              <FileText className="text-gold-500" />
              New Complaint Submission
            </h1>
            <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
              Submit your campus grievance with full details. It will be recorded and assigned directly to the responsible authority.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAIAnalyze}
            disabled={analyzingAI}
            className="border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100"
          >
            <Sparkles size={16} className={analyzingAI ? 'animate-spin' : 'text-purple-500'} />
            <span>{analyzingAI ? 'Analyzing...' : 'Analyze with AI'}</span>
          </Button>
        </div>
      </div>

      {/* AI Suggestion Banner if available */}
      {aiSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 mb-6 border-l-4 border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 border border-[#E2E5E9] dark:border-[#343A46]"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="space-y-1 text-sm">
              <div className="font-semibold text-purple-900 dark:text-purple-200">
                AI Smart Analysis Applied
              </div>
              <p className="text-[#1F2937] dark:text-[#D1D5DB]">
                <strong>Summary:</strong> {aiSuggestion.summary || 'Identified campus issue'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1B2028] border border-[#E2E5E9] dark:border-[#343A46] text-[#1F2937] dark:text-[#F8FAFC]">
                  Category: <strong>{aiSuggestion.category}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1B2028] border border-[#E2E5E9] dark:border-[#343A46] text-[#1F2937] dark:text-[#F8FAFC]">
                  Priority: <strong>{aiSuggestion.priority}</strong>
                </span>
                {aiSuggestion.recommendedDepartment && (
                  <span className="px-2 py-0.5 rounded bg-white dark:bg-[#1B2028] border border-[#E2E5E9] dark:border-[#343A46] text-[#1F2937] dark:text-[#F8FAFC]">
                    Dept: <strong>{aiSuggestion.recommendedDepartment}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Complaint Form */}
      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <Input
            id="complaint-title"
            label="Complaint Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Water shortage in Hostel Block C 2nd floor"
            required
            error={errors.title}
          />
          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            {formData.title.length}/200 characters
          </span>
        </div>

        {/* Category & Priority Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Category */}
          <div className="space-y-1">
            <label htmlFor="complaint-category" className="block text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="complaint-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="form-error">{errors.category}</p>}
          </div>

          {/* Department (Optional) */}
          <div className="space-y-1">
            <label htmlFor="complaint-department" className="block text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] mb-1 flex items-center gap-1.5">
              <Building2 size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
              <span>Target Department (Optional)</span>
            </label>
            <select
              id="complaint-department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Auto-assign or select department...</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Leave blank if unsure — administration will route appropriately.
            </span>
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] mb-2">
            Priority Level <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRIORITIES.map((p) => {
              const isSelected = formData.priority === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePrioritySelect(p.value)}
                  className={`p-3 rounded-lg border-2 text-center text-sm font-semibold transition-all ${
                    isSelected
                      ? `${p.color} ring-2 ring-[#B8892E] dark:ring-[#C89B3C] ring-offset-2 dark:ring-offset-[#1B2028]`
                      : 'border-[#E2E5E9] dark:border-[#343A46] hover:border-[#B8892E] dark:hover:border-[#C89B3C] bg-white dark:bg-[#1B2028] text-[#1F2937] dark:text-[#D1D5DB]'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="complaint-location" className="block text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] mb-1 flex items-center gap-1.5">
            <MapPin size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
            <span>Specific Location on Campus (Optional)</span>
          </label>
          <input
            id="complaint-location"
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Central Library 2nd Floor, Room 204 or Hostel Block B"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Textarea
            id="complaint-description"
            label="Detailed Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please describe what happened, when it happened, affected students, and any previous attempts to resolve it..."
            rows={5}
            required
            error={errors.description}
          />
          <div className="flex justify-between items-center text-xs text-[#6B7280] dark:text-[#9CA3AF]">
            <span>Minimum 10 characters required</span>
            <span>{formData.description.length} characters</span>
          </div>
        </div>

        {/* Optional Attachment / Evidence */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-1.5">
            <Paperclip size={16} className="text-[#6B7280] dark:text-[#9CA3AF]" />
            <span>Supporting Evidence / Attachment (Optional)</span>
          </label>

          {selectedFile ? (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-[#F0F1F3] dark:bg-[#252C36] border-[#E2E5E9] dark:border-[#343A46]">
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip size={18} className="text-gold-500 flex-shrink-0" />
                <span className="text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] truncate">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 hover:bg-[#E2E5E9] dark:hover:bg-[#343A46] rounded text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[#E2E5E9] dark:border-[#343A46] rounded-lg p-4 text-center hover:border-[#B8892E] dark:hover:border-[#C89B3C] transition-colors">
              <input
                type="file"
                id="file-upload"
                name="attachment"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-[#4B5563] dark:text-[#D1D5DB] flex flex-col items-center gap-1"
              >
                <Paperclip size={20} className="text-[#6B7280] dark:text-[#9CA3AF]" />
                <span className="text-[#B8892E] dark:text-[#E0B85C] font-semibold hover:underline">
                  Click to attach a document or photo
                </span>
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  PNG, JPG, PDF up to 5MB
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[#E2E5E9] dark:border-[#343A46] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="gold"
            size="md"
            isLoading={submitting}
            className="min-w-[180px]"
          >
            <Send size={18} />
            <span>Submit Complaint</span>
          </Button>
        </div>
      </form>
    </div>
  );
};
