import React, { useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

export default function ExpertCard({ expert, onPress }) {
  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, isDarkMode), [COLORS]);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.wrapper}
    >
      <View style={styles.card}>
        {/* Decorative accent circle */}
        <View style={styles.accentCircle} />

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {expert.name?.charAt(0)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {expert.name}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {expert.category}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              ⭐ {expert.rating}
            </Text>
          </View>
        </View>

        {/* Tags */}
        {expert.tags?.length > 0 && (
          <View style={styles.tagRow}>
            {expert.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom row */}
        <View style={styles.bottomRow}>
          <View style={styles.expPill}>
            <Text style={styles.expText}>
              💼 {expert.experience} yrs exp
            </Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (COLORS, isDarkMode) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      overflow: 'hidden',
      // Shadow
      shadowColor: COLORS.shadow,
      shadowOpacity: isDarkMode ? 0 : 0.07,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 6 },
      elevation: isDarkMode ? 0 : 3,
    },
    accentCircle: {
      position: 'absolute',
      top: -32,
      right: -32,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.primaryLight,
      opacity: 0.7,
    },

    // Top row
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    avatar: {
      width: 54,
      height: 54,
      borderRadius: 18,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '800',
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
      letterSpacing: -0.3,
      lineHeight: 20,
    },
    category: {
      fontSize: 12,
      color: COLORS.subText,
      fontWeight: '500',
      marginTop: 2,
    },
    ratingBadge: {
      backgroundColor: isDarkMode ? '#1C1800' : '#FFF6E5',
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: isDarkMode ? '#3D3000' : 'transparent',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '700',
      color: isDarkMode ? COLORS.warning : '#C07800',
    },

    // Tags
    tagRow: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 14,
      flexWrap: 'wrap',
    },
    tag: {
      backgroundColor: COLORS.primaryAltLight,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: isDarkMode ? '#2D1A5A' : 'transparent',
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: {
      fontSize: 11,
      fontWeight: '600',
      color: isDarkMode ? COLORS.primaryAlt : '#6B48F5',
    },

    // Divider
    divider: {
      height: 1,
      backgroundColor: COLORS.border,
      marginVertical: 16,
    },

    // Bottom row
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    expPill: {
      backgroundColor: COLORS.primaryLight,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: isDarkMode ? COLORS.primary : 'transparent',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    expText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.primary,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: COLORS.success,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.success,
    },
  });