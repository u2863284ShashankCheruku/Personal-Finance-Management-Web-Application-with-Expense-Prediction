import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, email: string, name?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('fintrack_token'));

  useEffect(() => {
    const syncAuthState = () => {
      const storedToken = localStorage.getItem('fintrack_token');
      const storedEmail = localStorage.getItem('fintrack_user_email');
      const storedName = localStorage.getItem('fintrack_user_name');

      setToken(storedToken);

      if (storedToken && storedEmail) {
        setUser({ email: storedEmail, name: storedName || undefined });
      } else {
        setUser(null);
      }
    };

    const handleUnauthorized = () => {
      syncAuthState();
    };

    syncAuthState();

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('fintrack:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('fintrack:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = (newToken: string, email: string, name?: string) => {
    const resolvedName = name || localStorage.getItem('fintrack_user_name') || email.split('@')[0];
    localStorage.setItem('fintrack_token', newToken);
    localStorage.setItem('fintrack_user_email', email);
    localStorage.setItem('fintrack_user_name', resolvedName);
    setToken(newToken);
    setUser({ email, name: resolvedName });
  };

  const logout = () => {
    localStorage.removeItem('fintrack_token');
    localStorage.removeItem('fintrack_user_email');
    localStorage.removeItem('fintrack_user_name');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
