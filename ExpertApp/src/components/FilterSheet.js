import React, { useContext, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

const SORT_OPTIONS = [
  { key: 'rating',     label: 'Rating',     icon: '⭐' },
  { key: 'experience', label: 'Experience',  icon: '💼' },
];

const MIN_RATINGS     = [null, 3, 4, 4.5];
const MIN_EXPERIENCES = [null, 2, 5, 10];

const RATING_LABELS = { null: 'Any', 3: '3+', 4: '4+', 4.5: '4.5+' };
const EXP_LABELS    = { null: 'Any', 2: '2+ yrs', 5: '5+ yrs', 10: '10+ yrs' };

export default function FilterSheet({
  visible,
  onClose,
  categories,
  filters,
  onApply,
  resultCount,
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, isDarkMode), [COLORS]);

  const [local, setLocal] = React.useState(filters);

  // Sync local state when sheet opens
  React.useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible, filters]);

  const set = (key, value) => setLocal(prev => ({ ...prev, [key]: value }));

  const handleApply = () => {
    onApply(local);
    onClose();
  };

  const handleReset = () => {
    const reset = {
      sortBy:        null,
      sortDir:       'desc',
      category:      'All',
      availableToday: false,
      minRating:     null,
      minExperience: null,
    };
    setLocal(reset);
    onApply(reset);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={styles.handle} />
        </View>

        {/* Title row */}
        <View style={styles.titleRow}>
          <Text style={styles.sheetTitle}>Filter & Sort</Text>
          <TouchableOpacity onPress={handleReset} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.resetText}>Reset all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ── Sort by ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sort by</Text>
            <View style={styles.sortRow}>
              {SORT_OPTIONS.map(opt => {
                const active = local.sortBy === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => set('sortBy', active ? null : opt.key)}
                    style={[styles.sortBtn, active && styles.sortBtnActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.sortBtnText, active && styles.sortBtnTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Direction (only visible when sortBy is set) ── */}
          {local.sortBy && (
            <View style={[styles.section, { paddingTop: 0 }]}>
              <Text style={styles.sectionLabel}>Direction</Text>
              <View style={styles.segRow}>
                {['desc', 'asc'].map((dir) => {
                  const label = dir === 'desc' ? '↓ High to low' : '↑ Low to high';
                  const active = local.sortDir === dir;
                  return (
                    <TouchableOpacity
                      key={dir}
                      onPress={() => set('sortDir', dir)}
                      style={[styles.seg, active && styles.segActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.segText, active && styles.segTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* ── Available today ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Availability</Text>
            <View style={styles.availRow}>
              <View>
                <Text style={styles.availLabel}>Available today</Text>
                <Text style={styles.availSub}>
                  Only show experts with slots today
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => set('availableToday', !local.availableToday)}
                style={[styles.toggle, local.availableToday && styles.toggleOn]}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.toggleKnob,
                  local.availableToday && styles.toggleKnobOn,
                ]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── Category ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.catGrid}>
              {categories.map(cat => {
                const active = local.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => set('category', cat)}
                    style={[styles.catChip, active && styles.catChipActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── Min rating ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Min. rating</Text>
            <View style={styles.segRow}>
              {MIN_RATINGS.map(val => {
                const active = local.minRating === val;
                const label = RATING_LABELS[val];
                return (
                  <TouchableOpacity
                    key={String(val)}
                    onPress={() => set('minRating', val)}
                    style={[styles.seg, active && styles.segActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segText, active && styles.segTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* ── Min experience ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Min. experience</Text>
            <View style={styles.segRow}>
              {MIN_EXPERIENCES.map(val => {
                const active = local.minExperience === val;
                const label = EXP_LABELS[val];
                return (
                  <TouchableOpacity
                    key={String(val)}
                    onPress={() => set('minExperience', val)}
                    style={[styles.seg, active && styles.segActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segText, active && styles.segTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </ScrollView>

        {/* Apply button */}
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApply}
          activeOpacity={0.88}
        >
          <Text style={styles.applyBtnText}>
            Show {resultCount} expert{resultCount !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const getStyles = (COLORS, isDarkMode) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.cardBorder,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 99, backgroundColor: COLORS.border },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4 },
  resetText:  { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Sections
  section:      { paddingHorizontal: 20, paddingBottom: 18 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: COLORS.subText,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 20, marginBottom: 18 },

  // Sort buttons
  sortRow: { flexDirection: 'row', gap: 8 },
  sortBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sortBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  sortBtnText:       { fontSize: 12, fontWeight: '600', color: COLORS.subText },
  sortBtnTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Segmented controls
  segRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  seg: { flex: 1, borderRadius: 9, paddingVertical: 8, alignItems: 'center' },
  segActive: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  segText:       { fontSize: 11, fontWeight: '600', color: COLORS.subText },
  segTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Available today toggle
  availRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  availSub:   { fontSize: 11, color: COLORS.subText, marginTop: 2 },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 99,
    backgroundColor: COLORS.border,
    padding: 3,
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  toggleOn:  { backgroundColor: COLORS.success, justifyContent: 'flex-end' },
  toggleKnob: { width: 18, height: 18, borderRadius: 99, backgroundColor: COLORS.white },

  // Category chips
  catGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip:         { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.cardBorder },
  catChipActive:   { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  catChipText:     { fontSize: 12, fontWeight: '600', color: COLORS.subText },
  catChipTextActive: { color: COLORS.primary, fontWeight: '700' },

  // Apply
  applyBtn: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
});