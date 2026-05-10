import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput as TextInputNative, 
  ActivityIndicator
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';
import CustomAlert from '../components/CustomAlert';

export default function BookingScreen({ route, navigation }) {
  const { expert, selectedDate, timeSlot } = route.params;

  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, isDarkMode), [COLORS]);

  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState(''); 
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (title, message, buttons = []) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const handleBooking = async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return showAlert('Missing details', 'Please fill in all fields before continuing.');
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return showAlert('Invalid email', 'Please enter a valid email address.');
    }

    // Phone Validation: Removes spaces/dashes and checks for 10 to 15 digits (with optional +)
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return showAlert(
        'Invalid phone number', 
        'Please enter a valid phone number (e.g., 9876543210 or +91 98765 43210).'
      );
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        expertId:  expert._id,
        userName:  name.trim(),
        userEmail: email.toLowerCase().trim(),
        phone:     cleanPhone, // Sending the cleaned phone number to the database is a good practice
        date:      selectedDate,
        timeSlot,
        notes:     notes.trim(),
      });
      
      showAlert('Booking confirmed!', "Your booking request has been sent to the Expert", [
        { text: 'Done', onPress: () => navigation.navigate('Experts') },
      ]);
    } catch (error) {
      console.error('Booking error:', error.response?.data);
      showAlert('Something went wrong', error.response?.data?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Session Info Card */}
          <View style={styles.sessionCard}>
            <View style={styles.sessionAvatar}>
              <Text style={styles.sessionAvatarText}>{expert.name?.charAt(0)}</Text>
            </View>
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionName}>{expert.name}</Text>
              <Text style={styles.sessionSlot}>{selectedDate}  ·  {timeSlot}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>⭐ {expert.rating}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>Your details</Text>

          {/* Input Fields */}
          <View style={styles.field}>
            <Ionicons name="person-outline" size={18} color={COLORS.subText} />
            <View style={styles.fieldInner}>
              <Text style={styles.fieldLabel}>Full name</Text>
              <TextInputNative
                value={name}
                onChangeText={setName}
                placeholder="Dhiraj Paul"
                placeholderTextColor={COLORS.subText + '70'}
                style={[styles.fieldInput, { color: COLORS.text }]}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Ionicons name="mail-outline" size={18} color={COLORS.subText} />
            <View style={styles.fieldInner}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInputNative
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="dhiraj@example.com"
                placeholderTextColor={COLORS.subText + '70'}
                style={[styles.fieldInput, { color: COLORS.text }]}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Ionicons name="call-outline" size={18} color={COLORS.subText} />
            <View style={styles.fieldInner}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInputNative
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+91 98765 43210"
                placeholderTextColor={COLORS.subText + '70'}
                style={[styles.fieldInput, { color: COLORS.text }]}
              />
            </View>
          </View>

          {/* Notes Field (Multi-line) */}
          <View style={[styles.field, styles.notesField]}>
            <Ionicons name="document-text-outline" size={18} color={COLORS.subText} style={{ marginTop: 4 }} />
            <View style={styles.fieldInner}>
              <Text style={styles.fieldLabel}>Notes for Expert</Text>
              <TextInputNative
                value={notes}
                onChangeText={setNotes}
                placeholder="Describe your query briefly..."
                placeholderTextColor={COLORS.subText + '70'}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[styles.fieldInput, styles.notesInput, { color: COLORS.text }]}
              />
            </View>
          </View>

          <View style={styles.durationPill}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.durationText}>Free · 60 Minutes Session</Text>
          </View>

          {/* Action Area */}
          <View style={styles.actionArea}>
            <TouchableOpacity
              style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
              onPress={handleBooking}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.confirmBtnText}>Confirm Booking</Text>
                  <Text style={styles.confirmBtnSub}>Instant Confirmation</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.lockRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={isDarkMode ? COLORS.primary : "#059669"} />
              <Text style={[styles.lockText, { color: isDarkMode ? COLORS.primary : "#059669" }]}>
                Verified Expert · No Payment Required
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={hideAlert}
      />
    </SafeAreaView>
  );
}

const getStyles = (COLORS, isDarkMode) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 150, // Huge padding to clear the Floating Tab Bar
    },
    sessionCard: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.glassBorder,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    sessionAvatar: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sessionAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    sessionInfo: { flex: 1, marginLeft: 12 },
    sessionName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    sessionSlot: { fontSize: 12, color: COLORS.subText, marginTop: 2 },
    ratingBadge: {
      backgroundColor: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : '#FFF6E5',
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#C07800' },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: COLORS.subText,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 10,
    },
    field: {
      backgroundColor: COLORS.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: COLORS.glassBorder,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    fieldInner: { flex: 1 },
    fieldLabel: { fontSize: 10, fontWeight: '700', color: COLORS.subText, textTransform: 'uppercase' },
    fieldInput: { fontSize: 15, fontWeight: '500', marginTop: 2, padding: 0 },
    notesField: { alignItems: 'flex-start', minHeight: 100 },
    notesInput: { height: 80, textAlignVertical: 'top' },
    durationPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF',
      padding: 12,
      borderRadius: 12,
      marginBottom: 24,
      gap: 6,
    },
    durationText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
    actionArea: { marginTop: 10 },
    confirmBtn: {
      backgroundColor: COLORS.primary,
      borderRadius: 18,
      height: 64,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: COLORS.primary,
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    confirmBtnDisabled: { opacity: 0.5 },
    confirmBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
    confirmBtnSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
    lockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
    lockText: { fontSize: 12, fontWeight: '600' },
  });