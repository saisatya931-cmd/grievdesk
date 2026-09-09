import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleQuickFill = () => {
    setEmail('student@gmail.com');
    setPassword('Password@123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Enforce student role authentication
      const user = await login(email, password, 'student');
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/student/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      let msg = typeof err === 'string' ? err : err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      if (
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('timeout') ||
         msg.toLowerCase().includes('network error') ||
         msg.includes('ECONNABORTED'))
      ) {
        msg = 'Unable to connect to the server. Please try again in a moment.';
      } else if (typeof msg === 'string' && (msg.includes('429') || msg.toLowerCase().includes('too many requests') || msg.toLowerCase().includes('too many authentication'))) {
        msg = 'Too many login attempts. Please wait a moment and try again.';
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
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
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-silver-400 via-gold-400 to-charcoal-700 shadow-md mx-auto mb-3">
              <img
                src="/logo.png"
                alt="GrievDesk Official Logo"
                className="w-full h-full object-cover rounded-full bg-charcoal-900"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 dark:text-white">
              Griev<span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 via-gold-400 to-amber-600 font-extrabold">Desk</span>
            </h1>
            <p className="text-xs sm:text-sm text-silver-500 dark:text-silver-400 mt-1">
              Sign in to your student portal
            </p>
          </div>

          {/* Student Portal Information Badge */}
          <div className="p-3 rounded-xl text-xs mb-6 flex items-start gap-2.5 bg-silver-50 dark:bg-charcoal-800/60 text-charcoal-700 dark:text-silver-300 border border-silver-200 dark:border-charcoal-700">
            <GraduationCap size={16} className="text-gold-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Student Portal:</strong> Access grievance submission, live tracking, and resolution updates.
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="student-email"
              name="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.edu"
              required
            />

            <Input
              id="student-password"
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              <span>Sign In to Student Portal</span>
              <ArrowRight size={16} className="text-gold-400" />
            </Button>
          </form>

          {/* Quick Demo Autofill Option (Student Only) */}
          <div className="mt-6 pt-4 border-t border-silver-200 dark:border-charcoal-700">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 rounded-lg border border-silver-200 dark:border-charcoal-700 text-xs text-charcoal-700 dark:text-silver-300 hover:bg-silver-50 dark:hover:bg-charcoal-800 transition-colors flex items-center justify-center gap-2"
            >
              <GraduationCap size={15} className="text-gold-500" />
              <span>Autofill Demo Student Credentials</span>
            </button>
          </div>

          {/* Footer link to register */}
          <div className="mt-6 text-center text-xs sm:text-sm text-silver-500 dark:text-silver-400">
            New to GrievDesk?{' '}
            <Link to="/register" className="text-gold-600 dark:text-gold-400 hover:underline font-semibold">
              Create a student account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
