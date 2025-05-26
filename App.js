import { StyleSheet, View } from 'react-native';
import HomeScreen from './app/index';
import LoadingSpinner from './src/components/LoadingSpinner';
import AuthScreen from './src/screens/AuthScreen';
import { AuthProvider, useAuth } from './src/services/AuthContext';

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {user ? <HomeScreen /> : <AuthScreen />}
    </View>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
