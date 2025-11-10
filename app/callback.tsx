import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import outputs from '../amplify_outputs.json';
import { useAuth } from '@/context/AuthContext';

/**
 * OAuth callback handler for Google sign-in redirects
 * This screen handles the redirect from Cognito Hosted UI
 */
export default function CallbackScreen() {
  const router = useRouter();
  const { checkAuthState } = useAuth();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Check auth state after OAuth redirect
    const handleCallback = async () => {
      try {
        let code: string | null = null;
        let error: string | null = null;
        let errorDescription: string | null = null;
        let redirectUri: string;
        
        // Check for code/error in URL params (from deep link or web)
        if (typeof window !== 'undefined' && window.location) {
          // Web: get from window.location
          const urlParams = new URLSearchParams(window.location.search);
          code = urlParams.get('code');
          error = urlParams.get('error');
          errorDescription = urlParams.get('error_description');
          redirectUri = `${window.location.origin}/callback`;
        } else {
          // Mobile: get from route params
          code = (params.code as string) || null;
          error = (params.error as string) || null;
          errorDescription = (params.error_description as string) || null;
          redirectUri = 'tinywinsmobile://callback';
        }
        
        if (error) {
          alert(`OAuth error: ${error}${errorDescription ? ' - ' + errorDescription : ''}`);
          router.replace('/(auth)/login');
          return;
        }
        
        if (code) {
          // Exchange code for tokens
          try {
            const oauthDomain = outputs.auth.oauth.domain;
            const clientId = outputs.auth.user_pool_client_id;
            
            // Exchange code for tokens
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
              throw new Error('Failed to exchange authorization code');
            }
            
            const tokenData = await tokenResponse.json();
            
            // Create user pool and session
            const userPool = new CognitoUserPool({
              UserPoolId: outputs.auth.user_pool_id,
              ClientId: clientId,
            });
            
            // Decode ID token to get username
            const idTokenParts = tokenData.id_token.split('.');
            let payload = idTokenParts[1];
            payload = payload.replace(/-/g, '+').replace(/_/g, '/');
            while (payload.length % 4) {
              payload += '=';
            }
            const tokenPayload = JSON.parse(atob(payload));
            const username = tokenPayload['cognito:username'] || tokenPayload.email || tokenPayload.sub;
            
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
            try {
              const { Cache } = require('@aws-amplify/core');
              const cacheKey = `CognitoIdentityServiceProvider.${clientId}.${username}.idToken`;
              const accessTokenKey = `CognitoIdentityServiceProvider.${clientId}.${username}.accessToken`;
              const refreshTokenKey = `CognitoIdentityServiceProvider.${clientId}.${username}.refreshToken`;
              
              await Cache.setItem(cacheKey, tokenData.id_token);
              await Cache.setItem(accessTokenKey, tokenData.access_token);
              await Cache.setItem(refreshTokenKey, tokenData.refresh_token);
            } catch (cacheError) {
              // Continue - session is set on user object
            }
            
            // Update auth context state
            await checkAuthState();
            
            // Navigate to main app
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 500);
            return; // Exit early since we handled everything
          } catch (tokenError: any) {
            const errorMsg = tokenError?.message || 'Failed to complete sign-in';
            alert(`Error: ${errorMsg}. Please try again.`);
            router.replace('/(auth)/login');
            return;
          }
        }
        
        // If we get here, either no code or not on web - just check auth state
        await checkAuthState();
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      } catch (error) {
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

