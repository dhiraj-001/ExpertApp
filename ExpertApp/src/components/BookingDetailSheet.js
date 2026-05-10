import React, { useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

function InfoRow({ icon, label, value, COLORS, styles }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={18} color={COLORS.primary} />
      </View>

      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoVal}>
          {value || '—'}
        </Text>
      </View>
    </View>
  );
}

export default function BookingDetailSheet({
  visible,
  onClose,
  booking,
}) {
  const { isDarkMode } = useContext(ThemeContext);

  const COLORS = isDarkMode
    ? darkColors
    : lightColors;

  const styles = useMemo(
    () => getStyles(COLORS, isDarkMode),
    [COLORS]
  );

  if (!booking) return null;

  const expertData =
    booking.expertId &&
    typeof booking.expertId === 'object'
      ? booking.expertId
      : {};

  const name =
    expertData.name ||
    booking.expertName ||
    'Expert';

  const category =
    expertData.category ||
    booking.expertCategory ||
    'Consultant';

  const rating = expertData.rating;
  const experience = expertData.experience;
  const tags = expertData.tags ?? [];

  const status = booking.status?.toLowerCase();

  const statusStyle =
    status === 'confirmed' ||
    status === 'completed'
      ? styles.statusConfirmed
      : status === 'pending'
      ? styles.statusPending
      : styles.statusDefault;

  const statusTextStyle =
    status === 'confirmed' ||
    status === 'completed'
      ? styles.statusTextConfirmed
      : status === 'pending'
      ? styles.statusTextPending
      : styles.statusTextDefault;

  const statusLabel = booking.status
    ? booking.status.charAt(0).toUpperCase() +
      booking.status.slice(1)
    : 'Pending';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />

      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {/* Close */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons
            name="close"
            size={20}
            color={COLORS.subText}
          />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
          }}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {name.charAt(0)}
              </Text>
            </View>

            <View style={styles.heroInfo}>
              <Text
                style={styles.expertName}
                numberOfLines={1}
              >
                {name}
              </Text>

              <Text
                style={styles.expertCat}
                numberOfLines={1}
              >
                {category}
              </Text>
            </View>

            <View style={statusStyle}>
              <Text style={statusTextStyle}>
                {statusLabel}
              </Text>
            </View>
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <View style={styles.tagRow}>
              {tags.slice(0, 4).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Stats */}
          {(rating || experience) && (
            <View style={styles.statsRow}>
              {rating != null && (
                <View style={styles.stat}>
                  <Ionicons
                    name="star"
                    size={18}
                    color="#F5B301"
                  />

                  <Text style={styles.statLabel}>
                    Rating
                  </Text>

                  <Text style={styles.statVal}>
                    {rating}
                  </Text>
                </View>
              )}

              {experience != null && (
                <View style={styles.stat}>
                  <Ionicons
                    name="briefcase-outline"
                    size={18}
                    color={COLORS.primary}
                  />

                  <Text style={styles.statLabel}>
                    Experience
                  </Text>

                  <Text style={styles.statVal}>
                    {experience} yrs
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.divider} />

          {/* Session Details */}
          <Text style={styles.sectionLabel}>
            Session Details
          </Text>

          <View style={styles.infoCard}>
            <InfoRow
              icon="calendar-outline"
              label="Date"
              value={booking.date}
              COLORS={COLORS}
              styles={styles}
            />

            <View style={styles.infoSep} />

            <InfoRow
              icon="time-outline"
              label="Time Slot"
              value={booking.timeSlot}
              COLORS={COLORS}
              styles={styles}
            />

            <View style={styles.infoSep} />

            <InfoRow
              icon="mail-outline"
              label="Email"
              value={booking.userEmail}
              COLORS={COLORS}
              styles={styles}
            />

            <View style={styles.infoSep} />

            <InfoRow
              icon="call-outline"
              label="Phone"
              value={booking.phone}
              COLORS={COLORS}
              styles={styles}
            />
          </View>

          {/* Notes */}
          {booking.notes ? (
            <>
              <Text
                style={[
                  styles.sectionLabel,
                  { marginTop: 24 },
                ]}
              >
                Session Notes
              </Text>

              <View style={styles.notesCard}>
                <Text style={styles.notesText}>
                  {booking.notes}
                </Text>
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

const getStyles = (COLORS, isDarkMode) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },

    sheet: {
      backgroundColor: COLORS.card,
      borderTopLeftRadius: 38,
      borderTopRightRadius: 38,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: COLORS.cardBorder,
      maxHeight: '90%',
      paddingHorizontal: 20,
      paddingTop: 8,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -6,
      },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 24,
    },

    // Handle
    handleWrap: {
      alignItems: 'center',
      paddingTop: 10,
      marginBottom: 8,
    },

    handle: {
      width: 46,
      height: 5,
      borderRadius: 99,
      backgroundColor: COLORS.border,
    },

    // Close
    closeBtn: {
      position: 'absolute',
      top: 18,
      right: 20,

      width: 36,
      height: 36,
      borderRadius: 99,

      backgroundColor: COLORS.background,

      alignItems: 'center',
      justifyContent: 'center',

      zIndex: 10,
    },

    // Hero
    hero: {
      flexDirection: 'row',
      alignItems: 'center',

      padding: 18,
      borderRadius: 24,

      marginBottom: 18,

      backgroundColor: isDarkMode
        ? 'rgba(124,92,255,0.12)'
        : 'rgba(108,92,231,0.08)',

      borderWidth: 1,

      borderColor: isDarkMode
        ? 'rgba(124,92,255,0.2)'
        : 'rgba(108,92,231,0.12)',
    },

    avatar: {
      width: 68,
      height: 68,
      borderRadius: 22,

      backgroundColor: COLORS.primary,

      justifyContent: 'center',
      alignItems: 'center',

      shadowColor: COLORS.primary,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },

    avatarText: {
      color: '#fff',
      fontSize: 28,
      fontWeight: '900',
    },

    heroInfo: {
      flex: 1,
      marginLeft: 16,
    },

    expertName: {
      fontSize: 21,
      fontWeight: '800',
      color: COLORS.text,
      letterSpacing: -0.4,
    },

    expertCat: {
      fontSize: 13,
      color: COLORS.subText,
      fontWeight: '600',
      marginTop: 4,
    },

    // Status
    statusConfirmed: {
      backgroundColor: isDarkMode
        ? '#0A2E20'
        : '#E8F9F1',

      borderRadius: 14,

      paddingHorizontal: 12,
      paddingVertical: 7,
    },

    statusTextConfirmed: {
      fontSize: 12,
      fontWeight: '800',
      color: isDarkMode
        ? '#34D399'
        : '#0A6644',
    },

    statusPending: {
      backgroundColor: isDarkMode
        ? '#1C1800'
        : '#FFF6E5',

      borderRadius: 14,

      paddingHorizontal: 12,
      paddingVertical: 7,
    },

    statusTextPending: {
      fontSize: 12,
      fontWeight: '800',
      color: isDarkMode
        ? COLORS.warning
        : '#C07800',
    },

    statusDefault: {
      backgroundColor: COLORS.background,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },

    statusTextDefault: {
      fontSize: 12,
      fontWeight: '800',
      color: COLORS.subText,
    },

    // Tags
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 18,
    },

    tag: {
      backgroundColor: COLORS.primaryAltLight,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },

    tagText: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.primaryAlt,
    },

    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: 14,
      marginBottom: 22,
    },

    stat: {
      flex: 1,

      backgroundColor: isDarkMode
        ? 'rgba(255,255,255,0.04)'
        : '#FFFFFF',

      borderRadius: 20,

      paddingVertical: 18,
      paddingHorizontal: 14,

      alignItems: 'center',

      borderWidth: 1,
      borderColor: COLORS.cardBorder,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: isDarkMode ? 0.2 : 0.08,
      shadowRadius: 10,
      elevation: 4,
    },

    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: COLORS.subText,
      marginTop: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    statVal: {
      fontSize: 18,
      fontWeight: '900',
      color: COLORS.text,
      marginTop: 5,
    },

    // Divider
    divider: {
      height: 1,
      backgroundColor: COLORS.border,
      marginBottom: 22,
    },

    sectionLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: COLORS.subText,
      textTransform: 'uppercase',
      marginBottom: 12,
      marginLeft: 4,
    },

    // Info Card
    infoCard: {
      backgroundColor: isDarkMode
        ? 'rgba(255,255,255,0.03)'
        : '#FFFFFF',

      borderRadius: 24,

      borderWidth: 1,
      borderColor: COLORS.cardBorder,

      overflow: 'hidden',

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: isDarkMode ? 0.18 : 0.06,
      shadowRadius: 12,
      elevation: 4,
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',

      paddingHorizontal: 18,
      paddingVertical: 18,

      gap: 14,
    },

    infoIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,

      backgroundColor: COLORS.primaryLight,

      alignItems: 'center',
      justifyContent: 'center',
    },

    infoText: {
      flex: 1,
    },

    infoLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: COLORS.subText,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },

    infoVal: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.text,
      marginTop: 4,
    },

    infoSep: {
      height: 1,
      backgroundColor: COLORS.border,
      marginLeft: 74,
    },

    // Notes
    notesCard: {
      backgroundColor: isDarkMode
        ? 'rgba(255,255,255,0.03)'
        : '#FFFFFF',

      borderRadius: 20,

      borderLeftWidth: 5,
      borderLeftColor: COLORS.primary,

      padding: 18,

      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },

    notesText: {
      fontSize: 14,
      lineHeight: 24,
      color: COLORS.text,
      fontWeight: '500',
    },
  });