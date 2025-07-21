import { useState, useCallback } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseImageUploadOptions {
  endpoint?: string;
  maxSize?: number; // in bytes
  acceptedFormats?: string[];
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  upload: (file: File) => Promise<string>;
  uploading: boolean;
  progress: UploadProgress | null;
  error: Error | null;
  reset: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    endpoint = '/api/upload/image',
    maxSize = 5 * 1024 * 1024, // 5MB default
    acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    onSuccess,
    onError
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(async (file: File): Promise<string> => {
    // Validation
    if (!acceptedFormats.includes(file.type)) {
      const err = new Error(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      setError(err);
      onError?.(err);
      throw err;
    }

    if (file.size > maxSize) {
      const err = new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      setError(err);
      onError?.(err);
      throw err;
    }

    setUploading(true);
    setError(null);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // TODO: Implement actual upload logic
      // For now, return a mock URL after simulated delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUrl = `https://example.com/uploads/${file.name}`;
      
      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      onSuccess?.(mockUrl);
      
      return mockUrl;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Upload failed');
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, [endpoint, maxSize, acceptedFormats, onSuccess, onError]);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  return {
    upload,
    uploading,
    progress,
    error,
    reset
  };
}