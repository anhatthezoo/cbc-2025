import { Maps, UserData, SearchBar, BottomSheet } from "@/components";
import { View, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";

export default function Index() {
  const params = useLocalSearchParams<{ destination?: string }>();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<string | undefined>();

  useEffect(() => {
    const setupDemoUsers = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          console.warn('Location permission denied');
          setIsLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const userLat = location.coords.latitude;
        const userLon = location.coords.longitude;

        // Create demo users near the user's location
        // Offset by ~0.002 degrees (roughly 200-300 meters)
        const demoUsers: UserData[] = [
          {
            id: '1',
            name: 'Alice',
            coordinate: {
              latitude: userLat + 0.002,
              longitude: userLon + 0.001,
            },
            heading: 45, // Facing northeast
          },
          {
            id: '2',
            name: 'Bob',
            coordinate: {
              latitude: userLat - 0.001,
              longitude: userLon + 0.002,
            },
            heading: 180, // Facing south
          },
          {
            id: '3',
            name: 'Charlie',
            coordinate: {
              latitude: userLat + 0.0015,
              longitude: userLon - 0.0018,
            },
            heading: 90, // Facing east
          },
          {
            id: '4',
            name: 'Diana',
            coordinate: {
              latitude: userLat - 0.0025,
              longitude: userLon - 0.001,
            },
            heading: 270, // Facing west
          },
          {
            id: '5',
            name: 'Emma',
            coordinate: {
              latitude: userLat + 0.003,
              longitude: userLon + 0.0025,
            },
            heading: 135, // Facing southeast
          },
          {
            id: '6',
            name: 'Frank',
            coordinate: {
              latitude: userLat - 0.0008,
              longitude: userLon - 0.0022,
            },
            heading: 0, // Facing north
          },
          {
            id: '7',
            name: 'Grace',
            coordinate: {
              latitude: userLat + 0.0012,
              longitude: userLon + 0.003,
            },
            heading: 225, // Facing southwest
          },
          {
            id: '8',
            name: 'Henry',
            coordinate: {
              latitude: userLat - 0.0018,
              longitude: userLon + 0.0015,
            },
            heading: 315, // Facing northwest
          },
        ];

        setUsers(demoUsers);
      } catch (error) {
        console.error('Error setting up demo users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupDemoUsers();
  }, []);

  // Watch for destination param from search screen
  useEffect(() => {
    if (params.destination) {
      setSelectedDestination(params.destination);
      setShowBottomSheet(true);
    }
  }, [params.destination]);

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleBottomSheetClose = () => {
    setShowBottomSheet(false);
    setSelectedDestination(undefined);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Maps
        users={users}
        onUserPress={(userId) => console.log('User pressed:', userId)}
      />

      {/* Search bar at bottom */}
      {!showBottomSheet && (
        <SearchBar onPress={handleSearchPress} />
      )}

      {/* Bottom sheet with nearby users */}
      <BottomSheet
        visible={showBottomSheet}
        users={users}
        destination={selectedDestination}
        onUserPress={(userId) => console.log('Selected user:', userId)}
        onClose={handleBottomSheetClose}
      />
    </View>
  );
}
