import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import BottomTabs from './src/navigation/BottomTabs';

// 1. Import your new ThemeProvider
import { ThemeProvider } from './src/context/ThemeContext';

const App = () => {
  return (
    // 2. Wrap your entire app with the ThemeProvider
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <BottomTabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;