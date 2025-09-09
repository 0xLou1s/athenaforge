import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStore } from '@/stores/user-store';

export const usePrivyAuth = () => {
  const { 
    ready, 
    authenticated, 
    user: privyUser, 
    login, 
    logout 
  } = usePrivy();
  
  const { 
    user, 
    setUser, 
    setAuthenticated, 
    setLoading, 
    setError,
    clearUser 
  } = useUserStore();

  // Sync Privy authentication state with Zustand store
  useEffect(() => {
    if (!ready) {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (authenticated && privyUser) {
      // Create or update user in Zustand store
      const userData = {
        id: privyUser.id,
        address: privyUser.wallet?.address || '',
        email: privyUser.email?.address,
        bio: '',
        github: '',
        twitter: '',
        telegram: '',
        skills: [],
        reputation: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(userData);
      setAuthenticated(true);
    } else {
      clearUser();
      setAuthenticated(false);
    }
  }, [ready, authenticated, privyUser, setUser, setAuthenticated, setLoading, clearUser]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await login();
    } catch (error) {
      setError('Login failed');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      clearUser();
    } catch (error) {
      setError('Logout failed');
      setLoading(false);
    }
  };

  return {
    // Privy state
    ready,
    authenticated,
    privyUser,
    
    // Zustand state
    user,
    isLoading: useUserStore.getState().isLoading,
    error: useUserStore.getState().error,
    
    // Actions
    login: handleLogin,
    logout: handleLogout,
    setError,
  };
};
