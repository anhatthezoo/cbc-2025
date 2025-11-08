import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/components';

// Mock location suggestions
const LOCATION_SUGGESTIONS = [
  { id: '1', name: 'Coffee Shop', address: '123 Main St' },
  { id: '2', name: 'Central Park', address: '456 Park Ave' },
  { id: '3', name: 'Downtown Plaza', address: '789 Center St' },
  { id: '4', name: 'Tech Campus', address: '321 Innovation Blvd' },
  { id: '5', name: 'Food Market', address: '654 Market St' },
];

export default function SearchScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuggestions = LOCATION_SUGGESTIONS.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (location: typeof LOCATION_SUGGESTIONS[0]) => {
    // Navigate back with the selected destination
    router.push({
      pathname: '/',
      params: { destination: location.name },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border, backgroundColor: theme.colors.background },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text
            style={[
              styles.backText,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily.regular,
                fontSize: theme.typography.fontSize.lg,
              },
            ]}
          >
            ← Back
          </Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.backgroundSecondary,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: theme.colors.backgroundTertiary },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          </View>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily.regular,
                fontSize: theme.typography.fontSize.base,
              },
            ]}
            placeholder="Where to?"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* Location Suggestions */}
      <FlatList
        data={filteredSuggestions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelectLocation(item)}
            style={({ pressed }) => [
              styles.suggestionItem,
              {
                backgroundColor: pressed
                  ? theme.colors.backgroundSecondary
                  : theme.colors.background,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.suggestionIcon,
                { backgroundColor: theme.colors.backgroundTertiary },
              ]}
            >
              <Text style={{ fontSize: 18 }}>📍</Text>
            </View>
            <View style={styles.suggestionContent}>
              <Text
                style={[
                  styles.suggestionName,
                  {
                    color: theme.colors.text,
                    fontFamily: theme.typography.fontFamily.regular,
                    fontWeight: theme.typography.fontWeight.semibold,
                  },
                ]}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.suggestionAddress,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamily.regular,
                    fontSize: theme.typography.fontSize.sm,
                  },
                ]}
              >
                {item.address}
              </Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamily.regular,
                },
              ]}
            >
              No locations found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  listContainer: {
    flexGrow: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    marginBottom: 4,
  },
  suggestionAddress: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
  },
});
