import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useTheme } from './ThemeProvider';
import { UserData } from './UserMarker';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface BottomSheetProps {
  /** Array of nearby users */
  users: UserData[];

  /** Destination name */
  destination?: string;

  /** Callback when a user is selected */
  onUserPress?: (userId: string) => void;

  /** Callback when close button is pressed */
  onClose?: () => void;

  /** Whether the sheet is visible */
  visible: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  users,
  destination,
  onUserPress,
  onClose,
  visible,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View
            style={[
              styles.handle,
              { backgroundColor: theme.colors.borderFocus },
            ]}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text
              style={[
                styles.title,
                {
                  color: theme.colors.text,
                  fontFamily: theme.typography.fontFamily.regular,
                  fontWeight: theme.typography.fontWeight.bold,
                  fontSize: theme.typography.fontSize.xl,
                },
              ]}
            >
              Nearby users
            </Text>
            {destination && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamily.regular,
                    fontSize: theme.typography.fontSize.sm,
                  },
                ]}
              >
                heading to {destination}
              </Text>
            )}
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text
              style={[
                styles.closeText,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.typography.fontFamily.regular,
                  fontSize: theme.typography.fontSize.lg,
                },
              ]}
            >
              ✕
            </Text>
          </Pressable>
        </View>

        {/* User List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
        >
          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.typography.fontFamily.regular,
                    fontSize: theme.typography.fontSize.base,
                  },
                ]}
              >
                No nearby users found
              </Text>
            </View>
          ) : (
            users.map((user) => (
              <Pressable
                key={user.id}
                onPress={() => onUserPress?.(user.id)}
                style={({ pressed }) => [
                  styles.userItem,
                  {
                    backgroundColor: pressed
                      ? theme.colors.backgroundSecondary
                      : theme.colors.background,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                {/* Avatar */}
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: theme.colors.backgroundTertiary,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color: theme.colors.primary,
                        fontFamily: theme.typography.fontFamily.regular,
                        fontWeight: theme.typography.fontWeight.semibold,
                      },
                    ]}
                  >
                    {user.name?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>

                {/* User Info */}
                <View style={styles.userInfo}>
                  <Text
                    style={[
                      styles.userName,
                      {
                        color: theme.colors.text,
                        fontFamily: theme.typography.fontFamily.regular,
                        fontWeight: theme.typography.fontWeight.semibold,
                        fontSize: theme.typography.fontSize.base,
                      },
                    ]}
                  >
                    {user.name || 'Anonymous'}
                  </Text>
                  <Text
                    style={[
                      styles.userDistance,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.typography.fontFamily.regular,
                        fontSize: theme.typography.fontSize.sm,
                      },
                    ]}
                  >
                    Nearby
                  </Text>
                </View>

                {/* Arrow */}
                <Text
                  style={[
                    styles.arrow,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  →
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    marginLeft: 16,
  },
  closeText: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 40,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userDistance: {},
  arrow: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {},
});
