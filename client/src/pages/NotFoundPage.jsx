import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-silver-100 via-white to-silver-100 dark:from-charcoal-950 dark:via-charcoal-900 dark:to-charcoal-950 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-9xl font-extrabold bg-gradient-to-r from-gold-600 via-gold-500 to-amber-600 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-4xl font-bold text-charcoal-900 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-base text-silver-500 dark:text-silver-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          onClick={() => navigate('/')}
          variant="primary"
          size="lg"
          className="gap-2"
        >
          <ArrowLeft size={20} className="text-gold-400" />
          <span>Back to Home</span>
        </Button>
      </motion.div>
    </div>
  );
};
