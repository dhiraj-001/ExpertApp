import React, { useContext, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MyBookingsScreen from '../screens/MyBookingsScreen';
import ExpertsStack from './ExpertsStack';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, insets), [COLORS, insets]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // Icon
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Experts: focused ? 'people' : 'people-outline',
            'My Bookings': focused ? 'calendar' : 'calendar-outline',
          };
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              <Ionicons name={icons[route.name]} size={22} color={color} />
            </View>
          );
        },

        // Colors
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tabInactive,

        // Label
        tabBarLabelStyle: styles.label,

        // Bar
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      })}
    >
      <Tab.Screen name="Experts" component={ExpertsStack} />
      <Tab.Screen name="My Bookings" component={MyBookingsScreen} />
    </Tab.Navigator>
  );
};

const getStyles = (COLORS, insets) =>
  StyleSheet.create({
    tabBar: {
      position: 'absolute',
      height: 64 + insets.bottom,
      paddingBottom: insets.bottom,
      paddingTop: 8,
      paddingHorizontal: 16,
      borderTopWidth: 0,
      backgroundColor: 'transparent',
      elevation: 0,
    },
    tabBarBg: {
      flex: 1,
      backgroundColor: COLORS.card,
      borderTopWidth: 1,
      borderTopColor: COLORS.cardBorder,
    },
    iconWrap: {
      width: 44,
      height: 32,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapActive: {
      backgroundColor: COLORS.primaryLight,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      marginBottom: 2,
    },
  });

export default BottomTabs;