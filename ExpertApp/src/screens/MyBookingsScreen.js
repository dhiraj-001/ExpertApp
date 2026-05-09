import React, { useState, useContext, useMemo, useCallback } from "react";
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
const BookingCard = React.memo(function BookingCard({ item, COLORS, styles }) {
  // Logic to handle populated or flat data from backend
  const expertData =
    item.expertId && typeof item.expertId === "object" ? item.expertId : {};
  const finalName = expertData.name || item.expertName || "Expert";
  const finalCat = expertData.category || item.expertCategory || "Consultant";
  const initials = finalName.charAt(0);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
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
          <Text style={styles.pillLabel}>Time Slot</Text>
          <Text style={styles.pillVal}>{item.timeSlot || "—"}</Text>
        </View>
      </View>

      {/* User Notes Section */}
      {item.notes ? (
        <View style={styles.notesContainer}>
          <Text style={styles.pillLabel}>Your Session Notes</Text>
          <Text style={styles.notesText} numberOfLines={3}>
            {item.notes}
          </Text>
        </View>
      ) : null}

      {/* Contact Reference */}
      <View style={styles.footerRow}>
        <Ionicons name="call-outline" size={12} color={COLORS.subText} />
        <Text style={styles.footerText}>Contact provided: {item.phone}</Text>
      </View>
    </View>
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

  const fetchMyBookings = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      // API call to fetch user specific bookings
      const res = await api.get(`/bookings?email=${trimmed}`);
      setBookings(res.data ?? []);
      setSearched(true);
    } catch (err) {
      setError("Unable to find bookings for this email.");
    } finally {
      setLoading(false);
    }
  }, [email]);

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
            placeholderTextColor={COLORS.subText + "70"}
            autoCapitalize="none"
            style={[styles.searchInput, { color: COLORS.text }]}
            onSubmitEditing={fetchMyBookings}
          />
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={fetchMyBookings}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchBtnText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <BookingCard item={item} COLORS={COLORS} styles={styles} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          searched && !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={COLORS.subText + "40"}
              />
              <Text style={styles.emptyTitle}>No bookings found</Text>
            </View>
          ) : null
        }
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
    subHeading: { fontSize: 14, color: COLORS.subText, marginTop: 4 },
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
      borderColor: COLORS.glassBorder,
      paddingHorizontal: 12,
      height: 52,
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: "500" },
    searchBtn: {
      backgroundColor: COLORS.primary,
      borderRadius: 14,
      height: 52,
      paddingHorizontal: 22,
      justifyContent: "center",
    },
    searchBtnText: { color: "#fff", fontWeight: "800" },
    listContent: { paddingHorizontal: 16, paddingBottom: 150 },
    card: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.glassBorder,
      padding: 16,
      marginBottom: 16,
    },
    cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: { color: "#fff", fontSize: 18, fontWeight: "800" },
    expertInfo: { flex: 1, marginLeft: 12 },
    expertName: { fontSize: 17, fontWeight: "700", color: COLORS.text },
    expertCat: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
    pillRow: { flexDirection: "row", gap: 10 },
    pill: {
      flex: 1,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.03)"
        : "rgba(0,0,0,0.02)",
      borderRadius: 12,
      padding: 10,
    },
    pillLabel: {
      fontSize: 9,
      fontWeight: "800",
      color: COLORS.subText,
      textTransform: "uppercase",
    },
    pillVal: {
      fontSize: 13,
      fontWeight: "700",
      color: COLORS.text,
      marginTop: 4,
    },
    notesContainer: {
      marginTop: 12,
      padding: 12,
      backgroundColor: isDarkMode
        ? "rgba(255,255,255,0.02)"
        : "rgba(0,0,0,0.01)",
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.primary,
    },
    notesText: {
      fontSize: 13,
      color: COLORS.subText,
      marginTop: 6,
      lineHeight: 18,
    },
    footerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      gap: 5,
    },
    footerText: { fontSize: 11, color: COLORS.subText, fontWeight: "500" },
    badgeConfirmed: {
      backgroundColor: isDarkMode ? "rgba(5, 150, 105, 0.15)" : "#E8F9F1",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeTextConfirmed: { fontSize: 11, fontWeight: "800", color: "#10B981" },
    badgePending: {
      backgroundColor: isDarkMode ? "rgba(217, 119, 6, 0.15)" : "#FFF6E5",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeTextPending: { fontSize: 11, fontWeight: "800", color: "#F59E0B" },
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
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: COLORS.subText,
      marginTop: 12,
    },
  });
