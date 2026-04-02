import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { errorHandler } from '@/lib/errorHandling';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        errorHandler.logError(error instanceof Error ? error : String(error), { context: 'auth-init' });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      errorHandler.logError(error instanceof Error ? error : String(error), { context: 'sign-out' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();

      if (error) throw error;

      setSession(refreshedSession);
      setUser(refreshedSession?.user ?? null);
    } catch (error) {
      errorHandler.logError(error instanceof Error ? error : String(error), { context: 'session-refresh' });
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
