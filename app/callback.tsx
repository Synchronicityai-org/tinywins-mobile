import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import * as Linking from 'expo-linking';

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
        // For web, check if we have the code or error in the URL
        // Note: When using expo.io redirect, the callback might come through expo.io first
        if (typeof window !== 'undefined' && window.location) {
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          const error = urlParams.get('error');
          const errorDescription = urlParams.get('error_description');
          
          console.log('Callback screen loaded');
          console.log('Current URL:', window.location.href);
          console.log('Hostname:', window.location.hostname);
          console.log('Code:', code ? code.substring(0, 20) + '...' : 'none');
          console.log('Error:', error || 'none');
          
          // Note: If we're on expo.io domain, this component won't run
          // Expo.io will try to redirect to the mobile app
          // For web, we need to manually copy the code from the URL and navigate
          // OR use a browser bookmarklet/extension to redirect
          
          // For now, if we somehow get here on expo.io, try to redirect
          if (window.location.hostname.includes('expo.io')) {
            console.log('⚠️ On expo.io domain - this component may not run');
            console.log('Current URL:', window.location.href);
            if (code) {
              console.log('Code found, attempting redirect to app...');
              // Try to redirect to our app
              try {
                window.location.href = `http://localhost:8081/callback?code=${encodeURIComponent(code)}`;
                return;
              } catch (e) {
                console.error('Redirect failed:', e);
                alert('Please copy the code from the URL and navigate to: http://localhost:8081/callback?code=YOUR_CODE');
              }
            }
          }
          
          if (error) {
            console.error('OAuth error in callback:', error, errorDescription);
            // Show error to user
            alert(`OAuth error: ${error}${errorDescription ? ' - ' + errorDescription : ''}`);
            router.replace('/(auth)/login');
            return;
          }
          
          if (code) {
            console.log('OAuth code received in callback URL, exchanging for tokens...');
            // For web, we need to manually exchange the code for tokens
            try {
              // Use the expo.io redirect URI that was used in the OAuth request
              const expoRedirectUri = outputs.auth.oauth.redirect_sign_in_uri.find((uri: string) => 
                uri.includes('expo.io')
              );
              const redirectUri = expoRedirectUri || 'https://auth.expo.io/@anonymous/tinywins-mobile';
              console.log('Using redirect URI for token exchange:', redirectUri);
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
                console.error('Token exchange failed:', errorText);
                throw new Error('Failed to exchange authorization code');
              }
              
              const tokenData = await tokenResponse.json();
              console.log('Tokens received successfully');
              
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
                console.warn('Failed to store session in cache:', cacheError);
              }
              
              console.log('Token exchange and session setup successful');
              
              // Update auth context state
              // We need to trigger a re-check of auth state
              await checkAuthState();
              
              // Navigate to main app
              setTimeout(() => {
                router.replace('/(tabs)');
              }, 500);
              return; // Exit early since we handled everything
            } catch (tokenError: any) {
              console.error('Error exchanging code for tokens:', tokenError);
              const errorMsg = tokenError?.message || 'Failed to complete sign-in';
              alert(`Error: ${errorMsg}. Please try again.`);
              router.replace('/(auth)/login');
              return;
            }
          } else {
            console.log('No code in callback URL, checking auth state anyway');
          }
        }
        
        // If we get here, either no code or not on web - just check auth state
        await checkAuthState();
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 500);
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        router.replace('/(auth)/login');
      }
    };

    handleCallback();
  }, []);

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

