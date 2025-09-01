// Hook for managing operation progress and timeout handling
import { useState, useCallback, useRef } from 'react';

export const useOperationStatus = (defaultTimeout = 30000) => {
  const [isOperating, setIsOperating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const timeoutRef = useRef(null);
  const cancelledRef = useRef(false);

  const updateProgress = useCallback((newProgress, newMessage = '') => {
    if (cancelledRef.current) return;
    
    setProgress(newProgress);
    setMessage(newMessage);
    
    // Clear existing timeout and set new one if operation is still running
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (newProgress < 100) {
      timeoutRef.current = setTimeout(() => {
        if (!cancelledRef.current) {
          setError('Operation timed out. Your progress has been saved.');
          setMessage('Operation timed out, but progress was saved.');
          setIsOperating(false);
        }
      }, defaultTimeout);
    }
  }, [defaultTimeout]);

  const startOperation = useCallback((initialMessage = 'Starting operation...') => {
    cancelledRef.current = false;
    setIsOperating(true);
    setProgress(0);
    setMessage(initialMessage);
    setError(null);
    setResult(null);
    
    // Set initial timeout
    timeoutRef.current = setTimeout(() => {
      if (!cancelledRef.current) {
        setError('Operation timed out. Your progress has been saved.');
        setMessage('Operation timed out, but progress was saved.');
        setIsOperating(false);
      }
    }, defaultTimeout);
  }, [defaultTimeout]);

  const completeOperation = useCallback((operationResult = null, successMessage = 'Operation completed successfully!') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setProgress(100);
    setMessage(successMessage);
    setResult(operationResult);
    setIsOperating(false);
    setError(null);
  }, []);

  const failOperation = useCallback((errorMessage = 'Operation failed') => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setError(errorMessage);
    setMessage(errorMessage);
    setIsOperating(false);
  }, []);

  const cancelOperation = useCallback(() => {
    cancelledRef.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setProgress(0);
    setMessage('Operation cancelled');
    setIsOperating(false);
    setError(null);
  }, []);

  const resetOperation = useCallback(() => {
    cancelledRef.current = false;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsOperating(false);
    setProgress(0);
    setMessage('');
    setError(null);
    setResult(null);
  }, []);

  // Auto-cleanup on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isOperating,
    progress,
    message,
    error,
    result,
    updateProgress,
    startOperation,
    completeOperation,
    failOperation,
    cancelOperation,
    resetOperation,
    cleanup
  };
};

// Hook for managing form auto-save with progress indication
export const useAutoSave = (saveFunction, debounceMs = 1000) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const timeoutRef = useRef(null);

  const save = useCallback(async (data) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      const result = await saveFunction(data);
      
      if (result && result.success === false) {
        throw new Error(result.error || 'Save failed');
      }
      
      setLastSaved(new Date());
      return result;
    } catch (error) {
      setSaveError(error.message);
      console.error('Auto-save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [saveFunction]);

  const debouncedSave = useCallback((data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, debounceMs);
  }, [save, debounceMs]);

  const forceSave = useCallback((data) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return save(data);
  }, [save]);

  const getSaveStatus = useCallback(() => {
    if (isSaving) return { status: 'saving', message: 'Saving...' };
    if (saveError) return { status: 'error', message: `Save failed: ${saveError}` };
    if (lastSaved) return { 
      status: 'saved', 
      message: `Last saved: ${lastSaved.toLocaleTimeString()}` 
    };
    return { status: 'unsaved', message: 'Not saved' };
  }, [isSaving, saveError, lastSaved]);

  return {
    isSaving,
    lastSaved,
    saveError,
    save: debouncedSave,
    forceSave,
    getSaveStatus
  };
};