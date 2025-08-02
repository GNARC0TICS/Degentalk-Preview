// Mock toast hook for static landing page
export function useToast() {
  return {
    toast: (options: any) => console.log('Toast:', options),
    dismiss: (id?: string) => console.log('Dismiss toast:', id)
  };
}