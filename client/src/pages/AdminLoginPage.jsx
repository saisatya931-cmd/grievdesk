import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, AlertCircle, Lock, ShieldAlert } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // If already authenticated as an administrator, go directly to Admin Dashboard
  if (isAuthenticated && user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleQuickFill = () => {
    setEmail('admin@grievdesk.com');
    setPassword('Admin@123456');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Enforce administrator role authentication
      const authUser = await login(email, password, 'admin');
      toast.success(`Administrator session initialized: ${authUser.name}`);
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin authentication error:', err);
      let msg =
        typeof err === 'string'
          ? err
          : err.response?.data?.message || err.message || 'Authentication failed. Please verify administrative credentials.';

      if (
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('timeout') ||
          msg.toLowerCase().includes('network error') ||
          msg.includes('ECONNABORTED'))
      ) {
        msg = 'Unable to connect to the server. Please try again in a moment.';
      } else if (
        typeof msg === 'string' &&
        (msg.includes('429') ||
          msg.toLowerCase().includes('too many requests') ||
          msg.toLowerCase().includes('too many authentication'))
      ) {
        msg = 'Too many authentication attempts. Please wait a moment and try again.';
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
        <div className="card p-6 sm:p-8 shadow-2xl border border-gold-500/30 dark:border-charcoal-700 bg-white dark:bg-charcoal-900 rounded-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-charcoal-900 via-gold-500 to-amber-600 shadow-lg mx-auto mb-3">
              <img
                src="/logo.png"
                alt="GrievDesk Official Logo"
                className="w-full h-full object-cover rounded-full bg-charcoal-900"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold-500/10 text-gold-700 dark:text-gold-300 border border-gold-500/30 text-xs font-bold mb-2">
              <ShieldCheck size={13} className="text-gold-500" />
              <span>Institutional Authority Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-charcoal-900 dark:text-white">
              Administrator Access
            </h1>
            <p className="text-xs sm:text-sm text-silver-500 dark:text-silver-400 mt-1">
              Authenticate with your institutional credentials
            </p>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl text-xs mb-6 flex items-start gap-2.5 bg-silver-50 dark:bg-charcoal-800/60 text-charcoal-700 dark:text-silver-300 border border-silver-200 dark:border-charcoal-700">
            <Lock size={15} className="text-gold-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Restricted Portal:</strong> Access is restricted to authorized university resolution authorities. Unauthorized access attempts are monitored and recorded.
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
              id="admin-email"
              name="email"
              label="Administrative Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@grievdesk.com"
              required
            />

            <Input
              id="admin-password"
              name="password"
              label="Security Password"
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
              <span>Authenticate & Enter Console</span>
              <ArrowRight size={16} className="text-gold-400" />
            </Button>
          </form>

          {/* Quick Demo Autofill Option (Demo Admin) */}
          <div className="mt-6 pt-4 border-t border-silver-200 dark:border-charcoal-700">
            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-2 px-3 rounded-lg border border-silver-200 dark:border-charcoal-700 text-xs text-charcoal-700 dark:text-silver-300 hover:bg-silver-50 dark:hover:bg-charcoal-800 transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck size={15} className="text-gold-500" />
              <span>Autofill Demo Administrator Credentials</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
