import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

export function configureAmplify() {
  try {
    Amplify.configure(outputs);
    console.log('Amplify configured successfully');
  } catch (error) {
    console.error('Error configuring Amplify:', error);
    // Don't throw - allow app to continue loading
    // The app can still work, just API calls will fail
  }
}

