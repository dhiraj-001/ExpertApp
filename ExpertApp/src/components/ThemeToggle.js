import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

export default function ThemeToggle({ style }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.8}
      style={[styles.button, {
        backgroundColor: COLORS.card,
        borderColor: COLORS.cardBorder,
      }, style]}
      accessibilityLabel={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityRole="button"
    >
      <Ionicons
        name={isDarkMode ? 'sunny' : 'moon'}
        size={18}
        color={isDarkMode ? COLORS.warning : COLORS.primary}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});