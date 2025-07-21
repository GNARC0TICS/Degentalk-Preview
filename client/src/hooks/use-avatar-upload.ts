import { useImageUpload } from './use-image-upload';
import { useToast } from './use-toast';

interface UseAvatarUploadOptions {
  userId?: string;
  onSuccess?: (avatarUrl: string) => void;
  maxSize?: number;
}

interface UseAvatarUploadReturn {
  uploadAvatar: (file: File) => Promise<string>;
  uploading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useAvatarUpload(options: UseAvatarUploadOptions = {}): UseAvatarUploadReturn {
  const { toast } = useToast();
  const {
    userId,
    onSuccess,
    maxSize = 2 * 1024 * 1024 // 2MB for avatars
  } = options;

  const {
    upload,
    uploading,
    error,
    reset
  } = useImageUpload({
    endpoint: '/api/upload/avatar',
    maxSize,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
    onSuccess: (url) => {
      toast({
        title: 'Avatar uploaded',
        description: 'Your avatar has been updated successfully.',
        variant: 'default'
      });
      onSuccess?.(url);
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const uploadAvatar = async (file: File): Promise<string> => {
    // TODO: Add avatar-specific validation (aspect ratio, dimensions)
    
    // Validate square aspect ratio
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          if (img.width !== img.height) {
            reject(new Error('Avatar must be square (1:1 aspect ratio)'));
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to load image'));
        };
        img.src = objectUrl;
      });
    } catch (err) {
      throw err;
    }

    return upload(file);
  };

  return {
    uploadAvatar,
    uploading,
    error,
    reset
  };
}