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
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

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

        // Generate 50+ demo users with random data
        const destinations = [
          'Coffee Shop',
          'Central Park',
          'Downtown Plaza',
          'Tech Campus',
          'Food Market',
        ];

        const firstNames = [
          'Alice', 'Bob', 'Charlie', 'Diana', 'Emma', 'Frank', 'Grace', 'Henry',
          'Ivy', 'Jack', 'Kate', 'Liam', 'Maya', 'Noah', 'Olivia', 'Paul',
          'Quinn', 'Rose', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xander',
          'Yara', 'Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Ellis', 'Finley',
          'Gray', 'Harper', 'Indigo', 'Jordan', 'Kai', 'Logan', 'Morgan', 'Nico',
          'Parker', 'Reese', 'Sage', 'Taylor', 'Val', 'West', 'Wren', 'Yuki',
          'Zara', 'Ash', 'Bailey', 'Cameron',
        ];

        const demoUsers: UserData[] = firstNames.map((name, index) => {
          // Random offset within ~1km radius
          const latOffset = (Math.random() - 0.5) * 0.01;
          const lonOffset = (Math.random() - 0.5) * 0.01;

          return {
            id: `${index + 1}`,
            name,
            coordinate: {
              latitude: userLat + latOffset,
              longitude: userLon + lonOffset,
            },
            heading: Math.floor(Math.random() * 360),
            destination: destinations[Math.floor(Math.random() * destinations.length)],
          };
        });

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
    setSelectedUserId(undefined);
  };

  const handleUserPress = (userId: string) => {
    console.log('Selected user:', userId);
    setSelectedUserId(userId);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Filter users by destination for bottom sheet
  const filteredUsers = selectedDestination
    ? users.filter(user => user.destination === selectedDestination)
    : [];

  // Debug logging
  console.log('Total users:', users.length);
  console.log('Selected destination:', selectedDestination);
  console.log('Filtered users:', filteredUsers.length);
  console.log('Show bottom sheet:', showBottomSheet);

  return (
    <View style={{ flex: 1 }}>
      <Maps
        users={users}
        selectedUserId={selectedUserId}
        onUserPress={handleUserPress}
      />

      {/* Search bar at bottom */}
      {!showBottomSheet && (
        <SearchBar onPress={handleSearchPress} />
      )}

      {/* Bottom sheet with nearby users */}
      <BottomSheet
        visible={showBottomSheet}
        users={filteredUsers}
        destination={selectedDestination}
        onUserPress={handleUserPress}
        onClose={handleBottomSheetClose}
      />
    </View>
  );
}
