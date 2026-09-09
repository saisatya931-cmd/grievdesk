import { forwardRef, useId } from 'react';
import { motion } from 'framer-motion';

export const Button = forwardRef(
  ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    ...props
  }, ref) => {
    const baseClasses = 'btn font-medium transition-all duration-200 flex items-center justify-center gap-2';
    
    const variants = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      gold: 'btn-gold',
      ghost: 'btn-ghost',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    const sizes = {
      sm: 'px-3 py-1 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
          disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        disabled={disabled || isLoading}
        whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export const Badge = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    gold: 'badge-gold',
    charcoal: 'badge-charcoal',
  };

  return <span className={`badge ${variants[variant]} ${className}`}>{children}</span>;
};

export const Input = forwardRef(
  ({ label, id, name, error, required = false, className = '', ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || (name ? `input-${name}` : (label ? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : generatedId));
    const inputName = name || id || inputId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1 text-[#1F2937] dark:text-[#D1D5DB]">
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={inputName}
          className={`input-field ${className}`}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef(
  ({ label, id, name, error, required = false, className = '', ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || (name ? `textarea-${name}` : (label ? `textarea-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : generatedId));
    const textareaName = name || id || textareaId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium mb-1 text-[#1F2937] dark:text-[#D1D5DB]">
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          name={textareaName}
          className={`input-field resize-none ${className}`}
          {...props}
        />
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export const Select = forwardRef(
  ({ label, id, name, error, options = [], required = false, className = '', ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || (name ? `select-${name}` : (label ? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : generatedId));
    const selectName = name || id || selectId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium mb-1 text-[#1F2937] dark:text-[#D1D5DB]">
            {label}
            {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          name={selectName}
          className={`input-field ${className}`}
          {...props}
        >
          <option value="">Select an option...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      className={`card p-6 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bg-white dark:bg-[#141A26] border border-[#E5E0D4] dark:border-[#1E2738] text-[#1F2937] dark:text-[#F8FAFC] rounded-xl shadow-2xl p-6 w-full ${sizes[size]}`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E5E0D4] dark:border-[#1E2738]">
          <h2 className="text-xl font-bold text-[#1F2937] dark:text-[#F8FAFC]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:text-[#1F2937] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC] hover:bg-[#F7F5F0] dark:hover:bg-[#1A2230] transition-colors"
          >
            ✕
          </button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
};

export const Skeleton = ({ count = 1, height = 'h-4', className = '' }) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${height} ${className}`} />
      ))}
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="w-16 h-16 text-[#6B7280] dark:text-[#9CA3AF] mb-4" />}
      <h3 className="text-lg font-bold text-[#1F2937] dark:text-[#F8FAFC] mb-2">{title}</h3>
      <p className="text-[#6B7280] dark:text-[#9CA3AF] mb-6 max-w-sm">{description}</p>
      {action && action}
    </div>
  );
};
