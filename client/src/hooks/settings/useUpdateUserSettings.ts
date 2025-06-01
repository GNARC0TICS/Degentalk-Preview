import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type for supported settings sections
export type SettingsSection = 'profile' | 'account' | 'notifications';

/**
 * Hook to update user settings
 * 
 * @param section - The settings section to update (profile, account, notifications)
 * @returns Mutation for updating the specified settings section
 */
export function useUpdateUserSettings(section: SettingsSection) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest({
        url: `/api/users/me/settings/${section}`,
        method: 'PUT',
        data
      });
    },
    onSuccess: () => {
      // Invalidate the user settings query to refetch the updated data
      queryClient.invalidateQueries({
        queryKey: ['user-settings']
      });
      
      // Show success toast
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast({
        title: "Failed to update settings",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  });
}

/**
 * Hook to update password
 * 
 * @returns Mutation for updating user password
 */
export function useUpdatePassword() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      return apiRequest({
        url: '/api/users/me/security/change-password',
        method: 'POST',
        data
      });
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      // Show error toast
      toast({
        title: "Failed to update password",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  });
} 