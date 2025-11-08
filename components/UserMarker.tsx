import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTheme } from './ThemeProvider';

export interface UserData {
  /** Unique user identifier */
  id: string;

  /** User's name */
  name?: string;

  /** User's location coordinates */
  coordinate: {
    latitude: number;
    longitude: number;
  };

  /** Direction user is facing in degrees (0-360) */
  heading?: number;

  /** Avatar URL (optional) */
  avatarUrl?: string;

  /** Where the user is heading to */
  destination?: string;
}

interface UserMarkerProps {
  /** User data to display */
  user: UserData;

  /** Callback when marker is pressed */
  onPress?: (userId: string) => void;
}

export const UserMarker: React.FC<UserMarkerProps> = ({ user, onPress }) => {
  const theme = useTheme();
  const heading = user.heading ?? 0;

  return (
    <Marker
      coordinate={user.coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={() => onPress?.(user.id)}
    >
      <View style={styles.container}>
        {/* Outer circle with direction indicator */}
        <View
          style={[
            styles.outerCircle,
            {
              backgroundColor: 'transparent',
              transform: [{ rotate: `${heading}deg` }],
            },
          ]}
        >
          {/* Direction arrow */}
          <View style={styles.arrowContainer}>
            <View
              style={[
                styles.arrow,
                {
                  borderBottomColor: theme.colors.primaryDark,
                },
              ]}
            />
          </View>
        </View>

        {/* Inner circle with avatar */}
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.primaryDark,
            },
          ]}
        >
          {/* Avatar placeholder - will be replaced with actual avatar later */}
          <View
            style={[
              styles.avatarPlaceholder,
              {
                backgroundColor: theme.colors.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                {
                  color: '#FFFFFF',
                  fontFamily: theme.typography.fontFamily.regular,
                  fontWeight: theme.typography.fontWeight.semibold,
                },
              ]}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        </View>
      </View>
    </Marker>
  );
};

const MARKER_SIZE = 56;
const INNER_SIZE = 44;
const AVATAR_SIZE = 36;
const ARROW_SIZE = 30;

const styles = StyleSheet.create({
  container: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  arrowContainer: {
    marginTop: 2,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE / 2,
    borderRightWidth: ARROW_SIZE / 2,
    borderBottomWidth: ARROW_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  innerCircle: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
});
