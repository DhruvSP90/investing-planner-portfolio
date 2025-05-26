import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary: '#2E7D32',
  secondary: '#1976D2',
  success: '#4CAF50',
  danger: '#F44336',
  warning: '#FF9800',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  border: '#E0E0E0',
};

export const SIZES = {
  // Screen dimensions
  width,
  height,
  
  // Font sizes
  h1: width * 0.08,
  h2: width * 0.065,
  h3: width * 0.055,
  body: width * 0.04,
  caption: width * 0.035,
  
  // Spacing
  padding: width * 0.04,
  margin: width * 0.025,
  radius: width * 0.03,
  
  // Component sizes
  cardHeight: height * 0.12,
  buttonHeight: height * 0.06,
};

export const isTablet = width >= 768;
export const isLargeScreen = width >= 1024;
