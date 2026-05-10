import React, { useContext, useMemo } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

export default function CustomAlert({
  visible,
  title,
  message,
  buttons = [], // Format: [{ text: 'OK', onPress: () => {}, style: 'default' | 'cancel' | 'destructive' }]
  onDismiss,
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, isDarkMode), [COLORS]);

  if (!visible) return null;

  // If no buttons are provided, default to a single "OK" button
  const alertButtons = buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onDismiss }];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        {/* Tap outside to close (optional, controlled by onDismiss) */}
        <Pressable style={styles.backdrop} onPress={onDismiss} />

        <View style={styles.alertBox}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.buttonContainer}>
            {alertButtons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    isCancel && styles.buttonCancel,
                    isDestructive && styles.buttonDestructive,
                  ]}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    if (onDismiss && !btn.keepOpen) onDismiss();
                  }}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel && styles.buttonTextCancel,
                      isDestructive && styles.buttonTextDestructive,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (COLORS, isDarkMode) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    alertBox: {
      width: '85%',
      maxWidth: 340,
      backgroundColor: COLORS.card,
      borderRadius: 24,
      padding: 24,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: COLORS.text,
      marginBottom: 8,
      letterSpacing: -0.3,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      color: COLORS.subText,
      lineHeight: 20,
      textAlign: 'center',
      marginBottom: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
    },
    button: {
      flex: 1,
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
    },
    // Cancel Style
    buttonCancel: {
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    buttonTextCancel: {
      color: COLORS.text,
    },
    // Destructive / Error Style
    buttonDestructive: {
      backgroundColor: isDarkMode ? '#3f0f0f' : '#FEF2F2',
      borderWidth: 1,
      borderColor: isDarkMode ? '#7f1d1d' : '#FECACA',
    },
    buttonTextDestructive: {
      color: COLORS.danger || '#ef4444', 
    },
  });