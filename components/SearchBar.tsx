import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from './ThemeProvider';

interface SearchBarProps {
  /** Callback when search bar is pressed */
  onPress: () => void;

  /** Placeholder text */
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onPress,
  placeholder = 'Where to?',
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.searchButton,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.8 : 1,
          },
          theme.shadows.lg,
        ]}
      >
        <View style={styles.content}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: theme.colors.backgroundTertiary,
              },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: theme.colors.text,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.placeholderText,
              {
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily.regular,
                fontWeight: theme.typography.fontWeight.medium,
                fontSize: theme.typography.fontSize.lg,
              },
            ]}
          >
            {placeholder}
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  searchButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  placeholderText: {
    flex: 1,
  },
});
