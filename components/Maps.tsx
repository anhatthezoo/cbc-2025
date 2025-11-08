import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { MapViewProps, Region, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from './ThemeProvider';
import { UserMarker, UserData } from './UserMarker';

interface MapsProps extends Omit<MapViewProps, 'style'> {
  /** Initial region to display */
  initialRegion?: Region;

  /** Array of users to display on the map */
  users?: UserData[];

  /** Callback when a user marker is pressed */
  onUserPress?: (userId: string) => void;

  /** Show user location */
  showsUserLocation?: boolean;

  /** Follow user location */
  followsUserLocation?: boolean;

  /** Show compass */
  showsCompass?: boolean;

  /** Show scale */
  showsScale?: boolean;

  /** Enable zoom controls */
  zoomEnabled?: boolean;

  /** Enable scroll */
  scrollEnabled?: boolean;

  /** Enable rotation */
  rotateEnabled?: boolean;

  /** Enable pitch/tilt */
  pitchEnabled?: boolean;
}

export const Maps: React.FC<MapsProps> = ({
  initialRegion,
  users = [],
  onUserPress,
  showsUserLocation = true,
  followsUserLocation = false,
  showsCompass = true,
  showsScale = true,
  zoomEnabled = true,
  scrollEnabled = true,
  rotateEnabled = true,
  pitchEnabled = true,
  ...props
}) => {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region | undefined>(initialRegion);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.warn('Location permission denied');
          // Fall back to default region if provided, or San Francisco
          setRegion(initialRegion || {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          setIsLoadingLocation(false);
          return;
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        // Set region to user's location
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        // Fall back to default region
        setRegion(initialRegion || {
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } finally {
        setIsLoadingLocation(false);
      }
    };

    getUserLocation();
  }, [initialRegion]);

  if (isLoadingLocation || !region) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT} // Use Apple Maps on iOS
        initialRegion={region}
        showsUserLocation={showsUserLocation}
        followsUserLocation={followsUserLocation}
        showsCompass={showsCompass}
        showsScale={showsScale}
        zoomEnabled={zoomEnabled}
        scrollEnabled={scrollEnabled}
        rotateEnabled={rotateEnabled}
        pitchEnabled={pitchEnabled}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        loadingEnabled={true}
        loadingIndicatorColor={theme.colors.primary}
        loadingBackgroundColor={theme.colors.background}
        {...props}
      >
        {/* Render user markers */}
        {users.map((user) => (
          <UserMarker key={user.id} user={user} onPress={onUserPress} />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
