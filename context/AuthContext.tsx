import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Auth } from 'aws-amplify';
import * as Linking from 'expo-linking';
import type { CognitoUser } from 'amazon-cognito-identity-js';

interface AuthContextType {
  user: CognitoUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<CognitoUser>;
  signUp: (username: string, password: string, email: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CognitoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      // Check auth state without timeout - let it fail naturally if not authenticated
      const currentUser = await Auth.currentAuthenticatedUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error: any) {
      // Not authenticated or error - this is normal for unauthenticated users
      // Only log if it's not a "not authenticated" error
      if (error?.code !== 'NotAuthorizedException' && error?.message !== 'The user is not authenticated') {
        console.log('Auth check:', error?.message || 'User not authenticated');
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();

    // Handle OAuth redirects
    const handleUrl = async (event: { url: string }) => {
      const { url } = event;
      if (url) {
        // Check if this is an OAuth callback
        if (url.includes('callback') || url.includes('code=')) {
          try {
            // Amplify will automatically handle the OAuth callback
            await checkAuthState();
          } catch (error) {
            console.error('Error handling OAuth callback:', error);
          }
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleUrl);

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const signIn = async (username: string, password: string): Promise<CognitoUser> => {
    try {
      const user = await Auth.signIn(username, password);
      setUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (username: string, password: string, email: string) => {
    try {
      const result = await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
        },
      });
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await Auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      await Auth.federatedSignIn({ provider: 'Google' });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

