import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import type { GetCurrentUserOutput } from 'aws-amplify/auth';
import { signIn as amplifySignIn, signOut as amplifySignOut, signUp as amplifySignUp, getCurrentUser } from 'aws-amplify/auth';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import outputs from '../amplify_outputs.json';

// Complete the OAuth session when the browser is closed
WebBrowser.maybeCompleteAuthSession();

// In Amplify v6, getCurrentUser returns GetCurrentUserOutput, not CognitoUser
// But we still use CognitoUser for Google OAuth manual flow
type AuthUser = GetCurrentUserOutput | CognitoUser | null;

interface AuthContextType {
  user: AuthUser;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (username: string, password: string) => Promise<AuthUser>;
  signUp: (username: string, password: string, email: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      // Check auth state without timeout - let it fail naturally if not authenticated
      const currentUser = await getCurrentUser();
      // In Amplify v6, getCurrentUser returns a different structure
      // We need to convert it to CognitoUser format or use it directly
      setUser(currentUser as any);
      setIsAuthenticated(true);
    } catch (error: any) {
      // Not authenticated or error - this is normal for unauthenticated users
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthState();

    // Handle OAuth redirects (for deep links and expo.io callbacks)
    const handleUrl = async (event: { url: string }) => {
      const { url } = event;
      if (url) {
        // Check if this is an OAuth callback with code or error
        const isOAuthCallback = (url.includes('code=') || url.includes('error=')) &&
                                (url.includes('callback') || url.startsWith('tinywinsmobile://') || url.includes('auth.expo.io'));
        
        if (isOAuthCallback) {
          try {
            // For mobile deep links, the callback screen will handle token exchange
            // We just need to navigate to it if we're not already there
            // The deep link should automatically route to the callback screen
            await checkAuthState();
          } catch (error) {
            // Silently handle OAuth callback errors
          }
        }
        // Silently ignore non-OAuth URLs (regular navigation)
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

  const signIn = async (username: string, password: string): Promise<AuthUser> => {
    try {
      // In Amplify v6, signIn returns a SignInOutput, not a CognitoUser
      const result = await amplifySignIn({ username, password });
      
      // Check if sign-in is complete or if there are next steps
      if (result.isSignedIn) {
        // Get the current user after sign in
        try {
          const currentUser = await getCurrentUser();
          
          // Update state immediately
          setUser(currentUser as any);
          setIsAuthenticated(true);
          setIsLoading(false);
          
          return currentUser as any;
        } catch (userError: any) {
          // Even if getCurrentUser fails, if isSignedIn is true, we should consider them authenticated
          setIsAuthenticated(true);
          setIsLoading(false);
          return {} as any; // Return empty object as fallback
        }
      } else if (result.nextStep) {
        // Handle next steps (like MFA, new password, etc.)
        throw new Error(`Sign-in requires additional step: ${result.nextStep.signInStep}`);
      } else {
        throw new Error('Sign-in did not complete successfully');
      }
    } catch (error: any) {
      setIsLoading(false);
      // Provide more detailed error messages
      let errorMessage = 'Failed to sign in';
      if (error?.name === 'NotAuthorizedException' || error?.name === 'NotAuthorizedError') {
        errorMessage = 'Incorrect username or password';
      } else if (error?.name === 'UserNotConfirmedException') {
        errorMessage = 'Please verify your email address';
      } else if (error?.name === 'UserNotFoundException') {
        errorMessage = 'User not found. Please sign up first.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).code = error?.name || error?.code;
      throw enhancedError;
    }
  };

  const signUp = async (username: string, password: string, email: string) => {
    try {
      const result = await amplifySignUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await amplifySignOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const oauthDomain = outputs.auth.oauth.domain;
      const clientId = outputs.auth.user_pool_client_id;
      const responseType = 'code';
      const scopeParam = outputs.auth.oauth.scopes.join(' ');
      const identityProvider = 'Google';
      
      // Determine platform and redirect URI following Expo best practices
      const isWeb = Platform.OS === 'web';
      const isExpoGo = Constants.appOwnership === 'expo';
      
      let redirectUri: string;
      
      if (isWeb) {
        // Web platform: use current origin + /callback
        // Must match exactly what callback screen will use
        if (typeof window !== 'undefined' && window.location) {
          // Remove any trailing slashes and ensure consistent format
          const origin = window.location.origin.replace(/\/$/, '');
          redirectUri = `${origin}/callback`;
        } else {
          redirectUri = 'http://localhost:8081/callback';
        }
      } else if (isExpoGo) {
        // Expo Go: use custom URL scheme (works better than expo.io)
        // The expo.io URL shows an error page, but custom scheme works
        redirectUri = 'tinywinsmobile://callback';
      } else {
        // Native build: use custom URL scheme
        redirectUri = 'tinywinsmobile://callback';
      }
      
      // Construct the Cognito Hosted UI URL
      const hostedUIRedirectUri = encodeURIComponent(redirectUri);
      const promptParam = 'select_account consent';
      const hostedUIUrl = `https://${oauthDomain}/oauth2/authorize?` +
        `identity_provider=${identityProvider}&` +
        `redirect_uri=${hostedUIRedirectUri}&` +
        `response_type=${responseType}&` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopeParam)}&` +
        `prompt=${encodeURIComponent(promptParam)}`;
      
      // Handle web platform: redirect directly
      if (isWeb) {
        window.location.href = hostedUIUrl;
        return;
      }
      
      // Handle mobile platforms: use expo-web-browser
      const result = await WebBrowser.openAuthSessionAsync(
        hostedUIUrl,
        redirectUri
      );
      
      // Handle cancellation
      if (result.type === 'cancel') {
        throw new Error('Sign-in was cancelled by user');
      }
      
      // Handle dismissal
      if (result.type === 'dismiss') {
        throw new Error('Browser was dismissed. Please try again.');
      }
      
      // Extract callback URL from result
      if (result.type !== 'success' || !('url' in result)) {
        throw new Error(`Unexpected OAuth result type: ${result.type}`);
      }
      
      const callbackUrl = result.url;
      if (!callbackUrl) {
        throw new Error('No callback URL received from OAuth flow');
      }
      
      // Handle expo.io redirects - extract code from expo.io URL
      let code: string | null = null;
      let error: string | null = null;
      let errorDescription: string | null = null;
      
      if (callbackUrl.includes('auth.expo.io')) {
        // Expo.io redirect - extract code from URL
        const codeMatch = callbackUrl.match(/[?&]code=([^&]+)/);
        const errorMatch = callbackUrl.match(/[?&]error=([^&]+)/);
        const errorDescMatch = callbackUrl.match(/[?&]error_description=([^&]+)/);
        
        code = codeMatch ? decodeURIComponent(codeMatch[1]) : null;
        error = errorMatch ? decodeURIComponent(errorMatch[1]) : null;
        errorDescription = errorDescMatch ? decodeURIComponent(errorDescMatch[1]) : null;
      } else {
        // Direct callback URL - parse normally
        const urlParams = new URL(callbackUrl);
        code = urlParams.searchParams.get('code');
        error = urlParams.searchParams.get('error');
        errorDescription = urlParams.searchParams.get('error_description');
      }
      
      // Handle OAuth errors
      if (error) {
        const errorMsg = errorDescription 
          ? `${error}: ${errorDescription}` 
          : error;
        throw new Error(`OAuth error: ${errorMsg}`);
      }
      
      // Ensure we have an authorization code
      if (!code) {
        throw new Error('No authorization code received from OAuth provider');
      }
      
      // Exchange authorization code for tokens
      const tokenEndpoint = `https://${oauthDomain}/oauth2/token`;
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri,
      });
      
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString(),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        let errorMessage = 'Failed to exchange authorization code for tokens';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error_description || errorJson.error || errorMessage;
        } catch {
          // Not JSON, use error text as-is
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const tokenData = await tokenResponse.json();
      
      // Create Cognito user pool
      const userPool = new CognitoUserPool({
        UserPoolId: outputs.auth.user_pool_id,
        ClientId: clientId,
      });
      
      // Decode ID token to extract user information
      const idTokenParts = tokenData.id_token.split('.');
      if (idTokenParts.length !== 3) {
        throw new Error('Invalid ID token format');
      }
      
      let payload = idTokenParts[1];
      // Fix base64 URL encoding
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) {
        payload += '=';
      }
      
      const tokenPayload = JSON.parse(atob(payload));
      const username = tokenPayload['cognito:username'] || tokenPayload.email || tokenPayload.sub;
      
      // Create Cognito user session
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool,
      });
      
      const idToken = new CognitoIdToken({ IdToken: tokenData.id_token });
      const accessToken = new CognitoAccessToken({ AccessToken: tokenData.access_token });
      const refreshToken = new CognitoRefreshToken({ RefreshToken: tokenData.refresh_token });
      
      const session = new CognitoUserSession({
        IdToken: idToken,
        AccessToken: accessToken,
        RefreshToken: refreshToken,
      });
      
      cognitoUser.setSignInUserSession(session);
      
      // Store session in Amplify cache for persistence
      try {
        const { Cache } = require('@aws-amplify/core');
        const cachePrefix = `CognitoIdentityServiceProvider.${clientId}.${username}`;
        
        await Promise.all([
          Cache.setItem(`${cachePrefix}.idToken`, tokenData.id_token),
          Cache.setItem(`${cachePrefix}.accessToken`, tokenData.access_token),
          Cache.setItem(`${cachePrefix}.refreshToken`, tokenData.refresh_token),
        ]);
      } catch (cacheError) {
        // Continue - session is set on user object
      }
      
      // Verify authentication state
      try {
        await getCurrentUser();
      } catch (verifyError) {
        // Continue - we'll set state manually
      }
      
      // Update auth context state
      setUser(cognitoUser as any);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
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

