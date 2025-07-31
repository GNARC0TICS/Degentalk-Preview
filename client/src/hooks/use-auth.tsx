// Mock auth hook for static landing page

export const useAuth = () => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: () => console.log('Login clicked'),
    logout: () => console.log('Logout clicked'),
    register: () => console.log('Register clicked'),
    logoutMutation: {
      mutate: () => console.log('Logout mutation')
    }
  };
};