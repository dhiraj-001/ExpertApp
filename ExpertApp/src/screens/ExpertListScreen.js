import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Text, Searchbar, ActivityIndicator, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../services/api';
import ExpertCard from '../components/ExpertCard';

// 1. Import your new Theme features
import ThemeToggle from '../components/ThemeToggle';
import { ThemeContext } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/colors'; 

export default function ExpertListScreen({ navigation }) {
  // 2. Consume the ThemeContext instead of the system theme
  const { isDarkMode } = useContext(ThemeContext);
  
  // Assign the correct palette dynamically based on our context
  const COLORS = isDarkMode ? darkColors : lightColors;

  // Generate the dynamic styles based on the current theme
  const styles = useMemo(() => getStyles(COLORS), [COLORS]);

  const [allExperts, setAllExperts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchExperts = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get('/experts'); 
      setAllExperts(res.data.experts || res.data || []);
    } catch (err) {
      console.error('Failed to fetch experts:', err);
      setError('Unable to load experts. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExperts();
  }, [fetchExperts]);

  const dynamicCategories = useMemo(() => {
    const uniqueCategories = [...new Set(allExperts.map(expert => expert.category))];
    const cleanCategories = uniqueCategories.filter(Boolean).sort();
    return ['All', ...cleanCategories];
  }, [allExperts]);

  const displayedExperts = useMemo(() => {
    return allExperts.filter(expert => {
      const matchesCategory = selectedCategory === 'All' || expert.category === selectedCategory;
      const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allExperts, searchQuery, selectedCategory]);

  const renderItem = useCallback(({ item }) => (
    <ExpertCard
      expert={item}
      onPress={() => navigation.navigate('ExpertDetail', { expert: item })}
    />
  ), [navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor={COLORS.background} 
        />
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={COLORS.background} 
      />

      {/* 3. Updated Header with the Toggle Button */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Find Experts</Text>
          <Text style={styles.subHeading}>Book sessions with top professionals</Text>
        </View>
        
        {/* Universal Theme Toggle Button */}
        <ThemeToggle />
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

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {dynamicCategories.map((category) => (
            <Chip
              key={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.chip,
                selectedCategory === category && styles.chipSelected
              ]}
              textStyle={[
                styles.chipText,
                selectedCategory === category && styles.chipTextSelected
              ]}
              showSelectedOverlay={false}
            >
              {category}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setLoading(true);
              fetchExperts();
            }}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayedExperts}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
              progressBackgroundColor={COLORS.background} 
            />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No experts found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your search or filters.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// Wrap the StyleSheet in a function to accept dynamic COLORS
const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Updated header to a flex row so the button sits on the right
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subHeading: {
    marginTop: 4,
    color: COLORS.subText,
    fontSize: 15,
  },
  search: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.glassBg, 
    borderWidth: 1,
    borderColor: COLORS.glassBorder, 
    elevation: 0, 
  },
  searchInput: {
    color: COLORS.text,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    backgroundColor: COLORS.glassBg, 
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 24, 
  },
  chipSelected: {
    backgroundColor: COLORS.primaryGlass, 
    borderColor: COLORS.primary, 
  },
  chipText: {
    color: COLORS.subText,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubText: {
    color: COLORS.subText,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: COLORS.subText,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primaryGlass,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: COLORS.primary, 
    fontWeight: '700',
    fontSize: 14,
  },
});