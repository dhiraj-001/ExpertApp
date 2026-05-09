import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api, socket } from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

// ─── Constants ────────────────────────────────────────────────────────────────
const ALL_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '01:00 PM', '02:00 PM', '03:00 PM',
];

// Build 7 days from today
function buildDateRange() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      label:    days[d.getDay()],
      day:      d.getDate(),
      isoDate:  d.toISOString().split('T')[0], // "YYYY-MM-DD"
    });
  }
  return result;
}

const DATE_RANGE = buildDateRange();

// ─── Sub-components ───────────────────────────────────────────────────────────
const DatePill = React.memo(function DatePill({ item, isSelected, onPress, styles }) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item.isoDate)}
      style={[styles.datePill, isSelected && styles.datePillActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.datePillDay, isSelected && styles.datePillDayActive]}>
        {item.label}
      </Text>
      <Text style={[styles.datePillNum, isSelected && styles.datePillNumActive]}>
        {item.day}
      </Text>
    </TouchableOpacity>
  );
});

const SlotButton = React.memo(function SlotButton({ slot, isBooked, onPress, styles }) {
  const [hour, period] = slot.split(' ');
  return (
    <TouchableOpacity
      onPress={() => !isBooked && onPress(slot)}
      disabled={isBooked}
      activeOpacity={0.8}
      style={[styles.slot, isBooked ? styles.slotBooked : styles.slotAvailable]}
    >
      <Text style={[styles.slotTime, isBooked && styles.slotTimeBooked]}>
        {hour}
      </Text>
      <Text style={[styles.slotPeriod, isBooked && styles.slotPeriodBooked]}>
        {isBooked ? 'Booked' : period}
      </Text>
    </TouchableOpacity>
  );
});


export default function ExpertDetailScreen({ route, navigation }) {
  const { expert } = route.params;

  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, isDarkMode), [COLORS]);

  const [selectedDate, setSelectedDate] = useState(DATE_RANGE[0].isoDate);
  const [bookedSlots, setBookedSlots]   = useState([]);
  const [loading, setLoading]           = useState(true);

  const selectedDateRef = useRef(selectedDate);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);

  const fetchBookedSlots = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/experts/${expert._id}/details?date=${selectedDate}`,
      );
      setBookedSlots(res.data?.bookedSlots ?? []);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setBookedSlots([]);
    } finally {
      setLoading(false);
    }
  }, [expert._id, selectedDate]);

  useEffect(() => { fetchBookedSlots(); }, [fetchBookedSlots]);

  useEffect(() => {
    const handler = (data) => {
      if (
        data.expertId === expert._id &&
        data.date     === selectedDateRef.current
      ) {
        setBookedSlots(prev =>
          prev.includes(data.timeSlot) ? prev : [...prev, data.timeSlot],
        );
      }
    };
    socket.on('slotBooked', handler);
    return () => socket.off('slotBooked', handler);
  }, [expert._id]);

  const handleDatePress = useCallback((isoDate) => {
    setSelectedDate(isoDate);
  }, []);

  const handleSlotPress = useCallback((slot) => {
    navigation.navigate('Booking', {
      expert,
      selectedDate,
      timeSlot: slot,
      // Payment/Rate param removed from here
    });
  }, [navigation, expert, selectedDate]);

  const availableCount = ALL_SLOTS.length - bookedSlots.length;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS.background}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Expert hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {expert.name?.charAt(0)}
              </Text>
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.expertName}>{expert.name}</Text>
              <Text style={styles.expertCat}>{expert.category}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {expert.rating}</Text>
            </View>
          </View>

          {/* Tags */}
          {expert.tags?.length > 0 && (
            <View style={styles.tagRow}>
              {expert.tags.slice(0, 4).map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Stats - Rate/Amount removed from here */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Experience</Text>
              <Text style={styles.statVal}>{expert.experience} yrs</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Sessions</Text>
              <Text style={styles.statVal}>{expert.sessions ?? '—'}</Text>
            </View>
            {/* Third stat column removed to simplify UI */}
          </View>
        </View>

        {/* Date picker */}
        <Text style={styles.sectionLabel}>Pick a date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {DATE_RANGE.map(item => (
            <DatePill
              key={item.isoDate}
              item={item}
              isSelected={selectedDate === item.isoDate}
              onPress={handleDatePress}
              styles={styles}
            />
          ))}
        </ScrollView>

        {/* Slot header */}
        <View style={styles.slotHeader}>
          <Text style={styles.sectionLabel}>Available slots</Text>
          {!loading && (
            <Text style={styles.slotCount}>
              {availableCount} open
            </Text>
          )}
        </View>

        {/* Slots grid */}
        {loading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginTop: 24 }}
          />
        ) : (
          <View style={styles.slotsGrid}>
            {ALL_SLOTS.map(slot => (
              <SlotButton
                key={slot}
                slot={slot}
                isBooked={bookedSlots.includes(slot)}
                onPress={handleSlotPress}
                styles={styles}
              />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (COLORS, isDarkMode) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 120,
    },

    // Hero card
    heroCard: {
      backgroundColor: COLORS.card,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      padding: 18,
      marginBottom: 24,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '800',
    },
    heroInfo: {
      flex: 1,
      marginLeft: 12,
    },
    expertName: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text,
      letterSpacing: -0.4,
    },
    expertCat: {
      fontSize: 13,
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
      paddingVertical: 5,
    },
    ratingText: {
      fontSize: 12,
      fontWeight: '700',
      color: isDarkMode ? COLORS.warning : '#C07800',
    },

    // Tags
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 14,
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

    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    stat: {
      flex: 1,
      backgroundColor: COLORS.background,
      borderRadius: 12,
      padding: 10,
    },
    statLabel: {
      fontSize: 9,
      fontWeight: '600',
      color: COLORS.subText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statVal: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.text,
      marginTop: 3,
    },

    // Section label
    sectionLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.9,
      color: COLORS.subText,
      textTransform: 'uppercase',
      marginBottom: 10,
    },
    slotHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    slotCount: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.success,
    },

    // Date pills
    dateScroll: {
      gap: 8,
      paddingBottom: 2,
      marginBottom: 24,
    },
    datePill: {
      width: 52,
      borderRadius: 16,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    datePillActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    datePillDay: {
      fontSize: 9,
      fontWeight: '700',
      color: COLORS.subText,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    datePillDayActive: {
      color: 'rgba(255,255,255,0.7)',
    },
    datePillNum: {
      fontSize: 16,
      fontWeight: '800',
      color: COLORS.text,
      marginTop: 2,
    },
    datePillNumActive: {
      color: '#fff',
    },

    // Slot grid
    slotsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    slot: {
      width: '30.5%',
      borderRadius: 16,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    slotAvailable: {
      backgroundColor: COLORS.primaryLight,
      borderColor: isDarkMode ? COLORS.primary : '#DBEAFE',
    },
    slotBooked: {
      backgroundColor: COLORS.background,
      borderColor: COLORS.border,
    },
    slotTime: {
      fontSize: 14,
      fontWeight: '800',
      color: COLORS.primary,
    },
    slotTimeBooked: {
      color: COLORS.tabInactive,
    },
    slotPeriod: {
      fontSize: 10,
      fontWeight: '600',
      color: COLORS.subText,
      marginTop: 2,
    },
    slotPeriodBooked: {
      color: isDarkMode ? COLORS.tabInactive : '#D0D5E8',
    },
  });