import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  View, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Text, Searchbar, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';
import ExpertCard from '../components/ExpertCard';
import ThemeToggle from '../components/ThemeToggle';
import FilterSheet from '../components/FilterSheet';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors';

const TODAY = new Date().toISOString().split('T')[0];

const DEFAULT_FILTERS = {
  sortBy:         null,
  sortDir:        'desc',
  category:       'All',
  availableToday: false,
  minRating:      null,
  minExperience:  null,
};

export default function ExpertListScreen({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);
  const COLORS = isDarkMode ? darkColors : lightColors;
  const styles = useMemo(() => getStyles(COLORS, isDarkMode), [COLORS]);

  // Data & Pagination State
  const [allExperts, setAllExperts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchExperts = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (pageNum === 1 && !shouldRefresh) setLoading(true);
      if (pageNum > 1) setLoadingMore(true);
      setError(null);

      // Fetching with explicit limit to handle backend pagination
      const res = await api.get(`/experts?page=${pageNum}&limit=6`);
      const newExperts = res.data.experts ?? res.data ?? [];
      
      const totalPages = res.data.totalPages || 1;
      setHasMore(pageNum < totalPages);

      if (pageNum === 1) {
        setAllExperts(newExperts);
      } else {
        setAllExperts(prev => [...prev, ...newExperts]);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load experts. Please check your connection.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchExperts(1); 
  }, [fetchExperts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchExperts(1, true);
  }, [fetchExperts]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExperts(nextPage);
    }
  }, [loading, loadingMore, hasMore, page, fetchExperts]);

  const categories = useMemo(() => {
    const unique = [...new Set(allExperts.map(e => e.category))].filter(Boolean).sort();
    return ['All', ...unique];
  }, [allExperts]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.sortBy) n++;
    if (filters.category !== 'All') n++;
    if (filters.availableToday) n++;
    if (filters.minRating) n++;
    if (filters.minExperience) n++;
    return n;
  }, [filters]);

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchQuery('');
  }, []);

  const displayedExperts = useMemo(() => {
    let list = allExperts.filter(expert => {
      if (filters.category !== 'All' && expert.category !== filters.category) return false;
      if (searchQuery && !expert.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filters.availableToday) {
        if (!expert.availableSlots?.some(s => s.startsWith(TODAY))) return false;
      }
      if (filters.minRating && (parseFloat(expert.rating) || 0) < filters.minRating) return false;
      if (filters.minExperience && (parseInt(expert.experience) || 0) < filters.minExperience) return false;
      return true;
    });

    if (filters.sortBy) {
      const dir = filters.sortDir === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (filters.sortBy === 'rating')
          return dir * ((parseFloat(a.rating) || 0) - (parseFloat(b.rating) || 0));
        if (filters.sortBy === 'experience')
          return dir * ((parseInt(a.experience) || 0) - (parseInt(b.experience) || 0));
        if (filters.sortBy === 'slots')
          return dir * ((a.availableSlots?.length || 0) - (b.availableSlots?.length || 0));
        return 0;
      });
    }
    return list;
  }, [allExperts, searchQuery, filters]);

  const renderItem = useCallback(({ item }) => (
    <ExpertCard
      expert={item}
      onPress={() => navigation.navigate('ExpertDetail', { expert: item })}
    />
  ), [navigation]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const hasAnyActive = activeFilterCount > 0 || searchQuery.length > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={COLORS.background} />

      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heading}>Find Experts</Text>
          <Text style={styles.subHeading}>Book sessions with top professionals</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => setSheetVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="options-outline" size={17} color={COLORS.text} />
            <Text style={styles.filterBtnText}>Filter</Text>
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <ThemeToggle />
        </View>
      </View>

      <Searchbar
        placeholder="Search by name..."
        placeholderTextColor={COLORS.subText}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.search}
        inputStyle={styles.searchInput}
        iconColor={COLORS.subText}
        clearIconColor={COLORS.subText}
      />

      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          {displayedExperts.length} expert{displayedExperts.length !== 1 ? 's' : ''} found
        </Text>
        {hasAnyActive && (
          <TouchableOpacity onPress={clearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchExperts(1)}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedExperts}
          keyExtractor={item => item._id?.toString() ?? Math.random().toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.card}
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No experts found</Text>
              <Text style={styles.emptySubText}>Try adjusting your filters.</Text>
            </View>
          }
        />
      )}

      <FilterSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        categories={categories}
        filters={filters}
        onApply={setFilters}
        resultCount={displayedExperts.length}
      />
    </SafeAreaView>
  );
}

const getStyles = (COLORS, isDarkMode) => StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heading:    { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: -0.8 },
  subHeading: { marginTop: 4, color: COLORS.subText, fontSize: 14, fontWeight: '500' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 99,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  search: {
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    elevation: 0,
    shadowOpacity: 0,
  },
  searchInput: { color: COLORS.text, fontSize: 15 },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultText: { fontSize: 11, fontWeight: '600', color: COLORS.subText, letterSpacing: 0.4 },
  clearText:  { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  listContent:    { paddingBottom: 120, paddingHorizontal: 16, flexGrow: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  emptyText:       { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  emptySubText:    { color: COLORS.subText, fontSize: 14, marginTop: 8, textAlign: 'center' },
  errorText:       { color: COLORS.subText, fontSize: 15, textAlign: 'center', marginBottom: 16 },
  retryButton: {
    backgroundColor: COLORS.primaryGlass,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});