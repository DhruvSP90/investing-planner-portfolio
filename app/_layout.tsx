import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Investment Portfolio',
          headerStyle: { backgroundColor: '#2E7D32' },
          headerTintColor: '#fff'
        }} 
      />
    </Stack>
  );
}
