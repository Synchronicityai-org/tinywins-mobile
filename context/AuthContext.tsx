import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { signIn as amplifySignIn, signUp as amplifySignUp, signOut as amplifySignOut, getCurrentUser } from 'aws-amplify/auth';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import outputs from '../amplify_outputs.json';
import {
  CognitoUserPool,
  CognitoUser,
  CognitoIdToken,
  CognitoAccessToken,
  CognitoRefreshToken,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import type { GetCurrentUserOutput } from 'aws-amplify/auth';

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
      // Only log if it's not a "not authenticated" error
      if (error?.name !== 'NotAuthorizedException' && error?.message !== 'The user is not authenticated') {
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

    // Handle OAuth redirects (for deep links and expo.io callbacks)
    const handleUrl = async (event: { url: string }) => {
      const { url } = event;
      if (url) {
        console.log('Deep link received:', url);
        // Check if this is an OAuth callback with code
        if (url.includes('code=') || url.includes('callback')) {
          try {
            // Check if it's an expo.io callback
            if (url.includes('auth.expo.io')) {
              console.log('Expo.io OAuth callback detected');
              // Extract code from URL
              const codeMatch = url.match(/[?&]code=([^&]+)/);
              if (codeMatch) {
                console.log('Code found in deep link, checking auth state...');
              }
            }
            // Check auth state - the callback screen will handle token exchange
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

  const signIn = async (username: string, password: string): Promise<AuthUser> => {
    try {
      console.log('Attempting to sign in with:', username);
      // In Amplify v6, signIn returns a SignInOutput, not a CognitoUser
      const result = await amplifySignIn({ username, password });
      console.log('Sign in result:', result);
      
      // Check if sign-in is complete or if there are next steps
      if (result.isSignedIn) {
        console.log('User is signed in');
        // Get the current user after sign in
        try {
          const currentUser = await getCurrentUser();
          console.log('Current user retrieved:', currentUser);
          
          // Update state immediately
          setUser(currentUser as any);
          setIsAuthenticated(true);
          setIsLoading(false);
          
          console.log('Auth state updated - isAuthenticated:', true);
          return currentUser as any;
        } catch (userError: any) {
          console.error('Error getting current user after sign-in:', userError);
          // Even if getCurrentUser fails, if isSignedIn is true, we should consider them authenticated
          setIsAuthenticated(true);
          setIsLoading(false);
          return {} as any; // Return empty object as fallback
        }
      } else if (result.nextStep) {
        // Handle next steps (like MFA, new password, etc.)
        console.log('Sign-in requires next step:', result.nextStep.signInStep);
        throw new Error(`Sign-in requires additional step: ${result.nextStep.signInStep}`);
      } else {
        throw new Error('Sign-in did not complete successfully');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
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
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await amplifySignOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      console.log('Starting Google sign-in...');
      
      const oauthDomain = outputs.auth.oauth.domain;
      const clientId = outputs.auth.user_pool_client_id;
      const responseType = 'code';
      const scopeParam = outputs.auth.oauth.scopes.join(' ');
      const identityProvider = 'Google';
      
      // Determine the correct redirect URI based on platform
      // Use redirect URIs that are already configured in Cognito
      let redirectUri: string;
      
      if (typeof window !== 'undefined' && window.location) {
        // We're on web (Expo web) - use expo.io URI which is already configured
        // This was working before - it shows Google accounts
        const expoRedirectUri = outputs.auth.oauth.redirect_sign_in_uri.find((uri: string) => 
          uri.includes('expo.io')
        );
        redirectUri = expoRedirectUri || 'https://auth.expo.io/@anonymous/tinywins-mobile';
        console.log('Web platform detected');
        console.log('Using Expo redirect URI (already configured):', redirectUri);
        console.log('This should show Google accounts page');
      } else {
        // We're on mobile (Expo Go or native) - use Expo redirect URI
        const expoRedirectUri = outputs.auth.oauth.redirect_sign_in_uri.find((uri: string) => 
          uri.includes('expo.io')
        );
        redirectUri = expoRedirectUri || 'tinywinsmobile://callback';
        console.log('Mobile platform detected, using redirect URI:', redirectUri);
      }
      
      console.log('Using redirect URI:', redirectUri);
      
      // Construct the Hosted UI URL
      const hostedUIRedirectUri = encodeURIComponent(redirectUri);
      const hostedUIUrl = `https://${oauthDomain}/oauth2/authorize?` +
        `identity_provider=${identityProvider}&` +
        `redirect_uri=${hostedUIRedirectUri}&` +
        `response_type=${responseType}&` +
        `client_id=${clientId}&` +
        `scope=${encodeURIComponent(scopeParam)}`;
      
      console.log('═══════════════════════════════════════════════════');
      console.log('OAuth Configuration:');
      console.log('  Redirect URI (original):', redirectUri);
      console.log('  Redirect URI (encoded):', hostedUIRedirectUri);
      console.log('  OAuth URL:', hostedUIUrl);
      console.log('');
      console.log('⚠️ CRITICAL: Add this EXACT redirect URI to Cognito:');
      console.log('   ', redirectUri);
      console.log('');
      console.log('Steps:');
      console.log('   1. Go to: https://console.aws.amazon.com/cognito/');
      console.log('   2. User Pool: us-east-2_6L23Phzl2');
      console.log('   3. App clients → ogv5cavllk2e3r2fncpcvheic → Edit');
      console.log('   4. Hosted UI → Allowed callback URLs');
      console.log('   5. Add:', redirectUri);
      console.log('   6. Allowed sign-out URLs → Add:', redirectUri);
      console.log('   7. Save and wait 1-2 minutes');
      console.log('═══════════════════════════════════════════════════');
      
      // For web, redirect directly (same as web app)
      if (typeof window !== 'undefined' && window.location) {
        console.log('Web platform: Redirecting to OAuth URL');
        window.location.href = hostedUIUrl;
        return; // Will redirect, so we return here
      }
      
      // For mobile, use WebBrowser
      console.log('Mobile platform: Opening browser for OAuth...');
      const result = await WebBrowser.openAuthSessionAsync(
        hostedUIUrl,
        redirectUri
      );
      
      console.log('OAuth result type:', result.type);
      console.log('OAuth result URL:', result.url);
      
      // Handle the callback URL - check for errors first, then extract code
      if (!result.url) {
        if (result.type === 'cancel') {
          throw new Error('Sign-in was cancelled by user');
        } else if (result.type === 'dismiss') {
          throw new Error('Browser was dismissed. Please try again.');
        } else {
          throw new Error(`Sign-in failed: ${result.type}. No callback URL received.`);
        }
      }
      
      console.log('OAuth callback received:', result.url);
      
      // Parse the callback URL to extract the code or error
      const callbackUrl = result.url;
      const urlMatch = callbackUrl.match(/[?&#]code=([^&]+)/);
      const errorMatch = callbackUrl.match(/[?&#]error=([^&]+)/);
      const errorDescMatch = callbackUrl.match(/[?&#]error_description=([^&]+)/);
      
      // Check for errors first
      if (errorMatch) {
        const error = decodeURIComponent(errorMatch[1]);
        const errorDesc = errorDescMatch ? decodeURIComponent(errorDescMatch[1]) : '';
        console.error('OAuth error in callback:', error, errorDesc);
        throw new Error(`OAuth error: ${error}${errorDesc ? ' - ' + errorDesc : ''}`);
      }
      
      // Extract authorization code
      if (!urlMatch) {
        console.error('No authorization code in callback URL:', callbackUrl);
        throw new Error(`OAuth failed: ${result.type}. No authorization code received. Check console for callback URL.`);
      }
      
      const code = decodeURIComponent(urlMatch[1]);
      console.log('Authorization code received');
      
      // Exchange code for tokens using Cognito token endpoint
      const tokenEndpoint = `https://${oauthDomain}/oauth2/token`;
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri,
      });
      
      console.log('Exchanging code for tokens...');
      console.log('Token endpoint:', tokenEndpoint);
      console.log('Token params:', {
        grant_type: 'authorization_code',
        client_id: clientId,
        code: code.substring(0, 20) + '...',
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
        console.error('Token exchange failed - Status:', tokenResponse.status);
        console.error('Token exchange failed - Response:', errorText);
        let errorMessage = 'Failed to exchange authorization code';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error_description || errorJson.error || errorMessage;
        } catch (e) {
          // Not JSON, use raw text
        }
        throw new Error(errorMessage);
      }
      
      const tokenData = await tokenResponse.json();
      console.log('Tokens received successfully');
      console.log('Token data keys:', Object.keys(tokenData));
      
      // Create user pool
      const userPool = new CognitoUserPool({
        UserPoolId: outputs.auth.user_pool_id,
        ClientId: clientId,
      });
      
      // Decode ID token to get username
      const idTokenParts = tokenData.id_token.split('.');
      let payload = idTokenParts[1];
      // Fix base64 padding
      payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      while (payload.length % 4) {
        payload += '=';
      }
      const tokenPayload = JSON.parse(atob(payload));
      const username = tokenPayload['cognito:username'] || tokenPayload.email || tokenPayload.sub;
      
      console.log('Username from token:', username);
      
      // Create Cognito user and session
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
      
      // Store session in Amplify's cache
      // This ensures Amplify recognizes the user as authenticated
      try {
        // Use Amplify's internal storage to persist the session
        const { Cache } = require('@aws-amplify/core');
        const cacheKey = `CognitoIdentityServiceProvider.${clientId}.${username}.idToken`;
        const accessTokenKey = `CognitoIdentityServiceProvider.${clientId}.${username}.accessToken`;
        const refreshTokenKey = `CognitoIdentityServiceProvider.${clientId}.${username}.refreshToken`;
        
        // Store tokens in Amplify's cache
        await Cache.setItem(cacheKey, tokenData.id_token);
        await Cache.setItem(accessTokenKey, tokenData.access_token);
        await Cache.setItem(refreshTokenKey, tokenData.refresh_token);
        
        console.log('Session stored in Amplify cache');
      } catch (cacheError) {
        console.warn('Failed to store session in cache:', cacheError);
        // Continue anyway - the session is set on the user object
      }
      
      // Verify the session is valid
      try {
        const currentUser = await getCurrentUser();
        console.log('Verified current user:', currentUser);
      } catch (verifyError) {
        console.warn('Could not verify current user:', verifyError);
        // Continue anyway - we'll set the state manually
      }
      
      // Update auth state
      setUser(cognitoUser as any);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      console.log('Google sign-in completed successfully');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
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

