import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    studentId: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.studentId
      );
      toast.success('Registration successful!');
      navigate('/student/dashboard');
    } catch (err) {
      let msg = typeof err === 'string' ? err : err.response?.data?.message || err.message || 'Registration failed.';
      if (
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('timeout') ||
         msg.toLowerCase().includes('network error') ||
         msg.includes('ECONNABORTED'))
      ) {
        msg = 'Unable to connect to the server. Please try again in a moment.';
      }
      toast.error(msg);
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-silver-100 via-white to-silver-100 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-950 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-6 sm:p-8 shadow-xl border border-silver-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 rounded-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-silver-400 via-gold-400 to-charcoal-700 shadow-md mx-auto mb-3">
              <img
                src="/logo.png"
                alt="GrievDesk Official Logo"
                className="w-full h-full object-cover rounded-full bg-charcoal-900"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 dark:text-white">
              Join Griev<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 font-extrabold">Desk</span>
            </h1>
            <p className="text-xs sm:text-sm text-silver-500 dark:text-silver-400 mt-1">
              Create your official student account
            </p>
          </div>

          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs mb-4">
              {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="register-name"
              label="Full Name"
              type="text"
              name="name"
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
              required
            />

            <Input
              id="register-student-id"
              label="Student ID (Optional)"
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="STU-2026-001"
            />

            <Input
              id="register-email"
              label="Email Address"
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="student@campus.edu"
              required
            />

            <Input
              id="register-password"
              label="Password"
              type="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              required
            />

            <Input
              id="register-confirm-password"
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full font-semibold"
            >
              <span>Create Student Account</span>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-silver-500 dark:text-silver-400">
              Already have an account?{' '}
              <Link to="/login" className="text-gold-600 dark:text-gold-400 hover:underline font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
