import { useState, useCallback, useEffect } from 'react';

// Debounce hook
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// API hook for fetching data
export const useApi = (apiFunction, initialData = null, shouldFetch = true) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(shouldFetch);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(params);
      setData(response.data?.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (shouldFetch) {
      fetchData();
    }
  }, []);

  return { data, loading, error, refetch: fetchData };
};

// Local storage hook
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

// Form validation hook
export const useForm = (initialValues, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
};

// Pagination hook
export const usePagination = (initialPage = 1, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / itemsPerPage);

  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    total,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    itemsPerPage,
  };
};
