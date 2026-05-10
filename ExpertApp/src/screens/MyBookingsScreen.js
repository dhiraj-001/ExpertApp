import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { api } from "../services/api";
import { ThemeContext } from "../context/ThemeContext";
import { lightColors, darkColors } from "../constants/colors";
import BookingDetailSheet from "../components/BookingDetailSheet";

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, styles }) {
  const s = status?.toLowerCase();
  const style =
    s === "confirmed" || s === "completed"
      ? styles.badgeConfirmed
      : s === "pending"
        ? styles.badgePending
        : styles.badgeDefault;
  const textStyle =
    s === "confirmed" || s === "completed"
      ? styles.badgeTextConfirmed
      : s === "pending"
        ? styles.badgeTextPending
        : styles.badgeTextDefault;
  return (
    <View style={style}>
      <Text style={textStyle}>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
      </Text>
    </View>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────
const BookingCard = React.memo(function BookingCard({
  item,
  COLORS,
  styles,
  onPress,
}) {
  const expertData =
    item.expertId && typeof item.expertId === "object" ? item.expertId : {};
  const finalName = expertData.name || item.expertName || "Expert";
  const finalCat = expertData.category || item.expertCategory || "Consultant";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={styles.card}
    >
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{finalName.charAt(0)}</Text>
        </View>
        <View style={styles.expertInfo}>
          <Text style={styles.expertName} numberOfLines={1}>
            {finalName}
          </Text>
          <Text style={styles.expertCat} numberOfLines={1}>
            {finalCat}
          </Text>
        </View>
        <StatusBadge status={item.status} styles={styles} />
      </View>

      <View style={styles.pillRow}>
        <View style={styles.pill}>
          <Text style={styles.pillLabel}>Date</Text>
          <Text style={styles.pillVal}>{item.date || "—"}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillLabel}>Time slot</Text>
          <Text style={styles.pillVal}>{item.timeSlot || "—"}</Text>
        </View>
      </View>

      {/* Tap hint */}
      <View style={styles.tapHint}>
        <Text style={styles.tapHintText}>View full details</Text>
        <Ionicons name="chevron-forward" size={13} color={COLORS.subText} />
      </View>
    </TouchableOpacity>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function MyBookingsScreen() {
  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, isDarkMode), [COLORS]);

  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Bug fix 1: was calling setItem instead of getItem
  useEffect(() => {
    const loadRecentSearches = async () => {
      try {
        const stored = await AsyncStorage.getItem("recent_booking_searches");
        if (stored) setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load searches", e);
      }
    };
    loadRecentSearches();
  }, []);

  const fetchMyBookings = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get(`/bookings?email=${trimmed}`);
      setBookings(res.data?.bookings ?? res.data ?? []);
      setSearched(true);

      const updatedSearches = [
        trimmed,
        ...recentSearches.filter((item) => item !== trimmed),
      ].slice(0, 5);

      setRecentSearches(updatedSearches);
      await AsyncStorage.setItem(
        "recent_booking_searches",
        JSON.stringify(updatedSearches),
      );
    } catch (err) {
      setError("Unable to find bookings for this email.");
    } finally {
      setLoading(false);
    }
  }, [email, recentSearches]);

  const handleCardPress = useCallback((booking) => {
    setSelectedBooking(booking);
    setSheetVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <BookingCard
        item={item}
        COLORS={COLORS}
        styles={styles}
        onPress={() => handleCardPress(item)}
      />
    ),
    [COLORS, styles, handleCardPress],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={COLORS.background}
      />

      <View style={styles.header}>
        <Text style={styles.heading}>My Bookings</Text>
        <Text style={styles.subHeading}>Track your professional sessions</Text>
      </View>

      {/* Search row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={COLORS.subText}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.tabInactive}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="search"
            onSubmitEditing={fetchMyBookings}
            style={[styles.searchInput, { color: COLORS.text }]}
          />
          {email.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setEmail("");
                setBookings([]);
                setSearched(false);
              }}
            >
              <Ionicons
                name="close-circle"
                size={17}
                color={COLORS.tabInactive}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchBtn, loading && { opacity: 0.6 }]}
          onPress={fetchMyBookings}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchBtnText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Recent searches */}
      {recentSearches.length > 0 && !searched && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Recent searches</Text>
          <View style={styles.recentRow}>
            {recentSearches.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.recentChip}
                onPress={() => setEmail(item)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time-outline"
                  size={12}
                  color={COLORS.subText}
                />
                <Text style={styles.recentChipText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Result count */}
      {searched && !loading && (
        <Text style={styles.resultCount}>
          {bookings.length === 0
            ? "No sessions found"
            : `${bookings.length} session${bookings.length > 1 ? "s" : ""} found`}
        </Text>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={COLORS.danger}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          searched && !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={COLORS.tabInactive}
              />
              <Text style={styles.emptyTitle}>No bookings found</Text>
              <Text style={styles.emptySub}>Try a different email address</Text>
            </View>
          ) : null
        }
      />

      {/* Detail sheet */}
      <BookingDetailSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        booking={selectedBooking}
      />
    </SafeAreaView>
  );
}

const getStyles = (COLORS, isDarkMode) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.background },
    header: { paddingHorizontal: 16, paddingTop: 12, marginBottom: 16 },
    heading: {
      fontSize: 32,
      fontWeight: "800",
      color: COLORS.text,
      letterSpacing: -0.8,
    },
    subHeading: {
      fontSize: 14,
      color: COLORS.subText,
      marginTop: 4,
      fontWeight: "500",
    },

    searchRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 10,
      marginBottom: 20,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      paddingHorizontal: 12,
      height: 52,
    },
    searchInput: { flex: 1, fontSize: 14, fontWeight: "500", padding: 0 },
    searchBtn: {
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      height: 52,
      paddingHorizontal: 22,
      justifyContent: "center",
      alignItems: "center",
    },
    searchBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },

    resultCount: {
      fontSize: 11,
      fontWeight: "600",
      color: COLORS.subText,
      letterSpacing: 0.5,
      paddingHorizontal: 16,
      marginBottom: 12,
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 12,
      backgroundColor: isDarkMode ? "#2A0A0A" : "#FEF2F2",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? "#5A1A1A" : "#FECACA",
      padding: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 13,
      color: COLORS.danger,
      fontWeight: "500",
    },

    listContent: { paddingHorizontal: 16, paddingBottom: 150, flexGrow: 1 },

    card: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
      padding: 16,
      marginBottom: 14,
    },
    cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
    expertInfo: { flex: 1, marginLeft: 12 },
    expertName: {
      fontSize: 15,
      fontWeight: "700",
      color: COLORS.text,
      letterSpacing: -0.2,
    },
    expertCat: {
      fontSize: 12,
      color: COLORS.subText,
      marginTop: 2,
      fontWeight: "500",
    },

    pillRow: { flexDirection: "row", gap: 8 },
    pill: {
      flex: 1,
      backgroundColor: COLORS.background,
      borderRadius: 12,
      padding: 10,
    },
    pillLabel: {
      fontSize: 9,
      fontWeight: "700",
      color: COLORS.subText,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    pillVal: {
      fontSize: 12,
      fontWeight: "700",
      color: COLORS.text,
      marginTop: 3,
    },

    tapHint: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: 12,
      gap: 3,
    },
    tapHintText: { fontSize: 11, color: COLORS.subText, fontWeight: "500" },

    // Badge styles
    badgeConfirmed: {
      backgroundColor: isDarkMode ? "#0A2E20" : "#E8F9F1",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeTextConfirmed: {
      fontSize: 11,
      fontWeight: "800",
      color: isDarkMode ? "#34D399" : "#0A6644",
    },
    badgePending: {
      backgroundColor: isDarkMode ? "#1C1800" : "#FFF6E5",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeTextPending: {
      fontSize: 11,
      fontWeight: "800",
      color: isDarkMode ? COLORS.warning : "#C07800",
    },
    badgeDefault: {
      backgroundColor: COLORS.background,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeTextDefault: {
      fontSize: 11,
      fontWeight: "800",
      color: COLORS.subText,
    },

    emptyContainer: { flex: 1, alignItems: "center", marginTop: 60 },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: COLORS.text,
      marginTop: 14,
    },
    emptySub: { fontSize: 13, color: COLORS.subText, marginTop: 6 },

    recentContainer: { paddingHorizontal: 16, marginBottom: 18 },
    recentTitle: {
      fontSize: 11,
      fontWeight: "700",
      color: COLORS.subText,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 10,
    },
    recentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    recentChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: COLORS.card,
      borderRadius: 99,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: COLORS.cardBorder,
    },
    recentChipText: { color: COLORS.text, fontSize: 12, fontWeight: "600" },
  });
