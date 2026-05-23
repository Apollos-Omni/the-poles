import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Debounced value hook for performance
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled callback hook
export const useThrottle = (callback, delay) => {
  const lastRan = useRef(Date.now());

  return useCallback((...args) => {
    if (Date.now() - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = Date.now();
    }
  }, [callback, delay]);
};

// Memoized expensive computation - Fixed dependencies
export const useExpensiveComputation = (computeFn, dependencies) => {
  return useMemo(() => {
    const startTime = performance.now();
    const result = computeFn();
    const endTime = performance.now();
    
    if (endTime - startTime > 16) { // More than one frame
      console.warn(`Expensive computation took ${endTime - startTime}ms`);
    }
    
    return result;
  }, [computeFn, ...dependencies]); // Fixed: include computeFn and spread dependencies
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (elementRef, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [elementRef, options]);

  return isIntersecting;
};

// Cancelable async operation
export const useCancelableAsync = () => {
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (asyncFunction) => {
    // Cancel previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      return await asyncFunction(abortControllerRef.current.signal);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Operation was cancelled');
        return null;
      }
      throw error;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return execute;
};