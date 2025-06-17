import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query'; // Type-only import
import { useToast } from '@/hooks/use-toast'; // Assuming this is your custom toast hook

interface CrudMutationOptions<TData, TError, TVariables, TContext> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKeyToInvalidate?: QueryKey | QueryKey[]; // Query key(s) to invalidate on success
  successMessage?: string;
  errorMessage?: string;
  toastDuration?: number;
  
  // For optimistic updates
  onMutate?: (variables: TVariables) => Promise<TContext | undefined> | TContext | undefined;
  onError?: (error: TError, variables: TVariables, context?: TContext) => Promise<unknown> | unknown;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables, context?: TContext) => Promise<unknown> | unknown;
  // onSuccess is handled by the hook for toast and invalidation, but can be extended
  onSuccessCallback?: (data: TData, variables: TVariables, context?: TContext) => void;
}

export function useCrudMutation<
  TData = unknown,
  TError = Error, // Default error type
  TVariables = void,
  TContext = unknown
>({
  mutationFn,
  queryKeyToInvalidate,
  successMessage = 'Operation successful!',
  errorMessage = 'An error occurred.',
  toastDuration = 2500,
  onMutate,
  onError,
  onSettled,
  onSuccessCallback,
}: CrudMutationOptions<TData, TError, TVariables, TContext>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<TData, TError, TVariables, TContext>({
    mutationFn,
    onMutate,
    onSuccess: (data, variables, context) => {
      toast({
        title: 'Success',
        description: successMessage,
        duration: toastDuration,
      });

      if (queryKeyToInvalidate) {
        const keysToInvalidate = Array.isArray(queryKeyToInvalidate) 
          ? queryKeyToInvalidate 
          : [queryKeyToInvalidate];
        
        keysToInvalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      
      if (onSuccessCallback) {
        onSuccessCallback(data, variables, context);
      }
    },
    onError: (error: TError, variables, context) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : errorMessage,
        duration: toastDuration + 1500, // Longer duration for errors
      });
      if (onError) {
        return onError(error, variables, context);
      }
    },
    onSettled,
  });
}
