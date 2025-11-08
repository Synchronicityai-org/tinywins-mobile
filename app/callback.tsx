import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/context/AuthContext';

/**
 * OAuth callback handler for Google sign-in redirects
 * This screen handles the redirect from Cognito Hosted UI
 */
export default function CallbackScreen() {
  const router = useRouter();
  const { checkAuthState } = useAuth();

  useEffect(() => {
    // Check auth state after OAuth redirect
    const handleCallback = async () => {
      try {
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

