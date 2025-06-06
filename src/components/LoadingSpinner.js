import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';

const LoadingSpinner = ({ size = 'large' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={COLORS.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default LoadingSpinner;
