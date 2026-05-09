import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ExpertListScreen from '../screens/ExpertListScreen';
import ExpertDetailScreen from '../screens/ExpertDetailScreen';
import BookingScreen from '../screens/BookingScreen';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

const Stack = createNativeStackNavigator();

export default function ExpertsStack() {
  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;

  const screenOptions = {
    headerShown: false,
  };

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="ExpertList"
        component={ExpertListScreen}
      />
      <Stack.Screen
        name="ExpertDetail"
        component={ExpertDetailScreen}
        options={{
          headerShown: true,
          title: 'Expert Details',
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 17,
            fontWeight: '700',
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          headerShown: true,
          title: 'Book Session',
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            color: COLORS.text,
            fontSize: 17,
            fontWeight: '700',
          },
          headerShadowVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}