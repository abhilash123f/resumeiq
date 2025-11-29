import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Hook to poll job status for long-running analysis
 * Fails silently if backend polling endpoints don't exist
 * 
 * @param {string} jobId - The job/match ID to poll
 * @param {number} interval - Polling interval in milliseconds (default: 2000)
 * @returns {object} - { progress, status, error, isPolling }
 */
function useJobStatus(jobId, interval = 2000) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending'); // pending, processing, completed, error
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollIntervalRef = useRef(null);
  const attemptCountRef = useRef(0);
  const maxAttempts = 30; // Stop polling after 60 seconds (30 * 2s)

  useEffect(() => {
    if (!jobId) {
      return;
    }

    // Start polling
    setIsPolling(true);
    attemptCountRef.current = 0;

    const pollJobStatus = async () => {
      try {
        // Try to fetch job status from backend
        // If endpoint doesn't exist, this will fail silently
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/match/status/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (response.data) {
          setProgress(response.data.progress || 0);
          setStatus(response.data.status || 'processing');

          // Stop polling if completed or error
          if (response.data.status === 'completed' || response.data.status === 'error') {
            stopPolling();
          }
        }
      } catch (err) {
        // Fail silently - backend polling endpoint might not exist yet
        // Simulate progress instead
        attemptCountRef.current += 1;
        const simulatedProgress = Math.min((attemptCountRef.current / maxAttempts) * 100, 95);
        setProgress(simulatedProgress);

        // Stop polling after max attempts
        if (attemptCountRef.current >= maxAttempts) {
          stopPolling();
          setStatus('timeout');
        }
      }
    };

    const stopPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setIsPolling(false);
    };

    // Start polling immediately
    pollJobStatus();

    // Set up interval
    pollIntervalRef.current = setInterval(pollJobStatus, interval);

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [jobId, interval]);

  return {
    progress,
    status,
    error,
    isPolling,
  };
}

export default useJobStatus;
