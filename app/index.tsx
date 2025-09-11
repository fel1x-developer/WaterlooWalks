import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

import WATMapView from "../src/components/MapView";
import DirectionsListItem from "../src/components/DirectionsListItem";
import { Dijkstra, AdjacencyList, Route } from "../src/algorithm/dijkstra";
import {
  getStartEndLocations,
  getBuildingFloorOptions,
  getBuildingOptions,
  getFloorOptions,
  OptionType,
} from "../src/utils/locations";

import geoJsonData from "../src/geojson/paths.json";
import { GeoJson } from "../src/algorithm/types";

const geoJson = geoJsonData as GeoJson;

const mapTypeOptions = [
  { label: "Standard", value: "standard" as const },
  { label: "Satellite", value: "satellite" as const },
  { label: "Hybrid", value: "hybrid" as const },
];

export default function Index() {
  const UWMap = useMemo(() => new Dijkstra(new AdjacencyList(geoJson)), []);
  const startEndLocations = useMemo(getStartEndLocations, []);
  const buildingFloorOptions = useMemo(getBuildingFloorOptions, []);
  const buildingOptions = useMemo(
    () => getBuildingOptions(buildingFloorOptions),
    [buildingFloorOptions],
  );

  const [startBuilding, setStartBuilding] = useState<string | null>(null);
  const [startFloor, setStartFloor] = useState<string | null>(null);
  const [endBuilding, setEndBuilding] = useState<string | null>(null);
  const [endFloor, setEndFloor] = useState<string | null>(null);
  const [tunnellingPreference, setTunnellingPreference] = useState<string>(
    "COMPARE_BY_TIME_OUTSIDE_THEN_TIME",
  );
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">(
    "standard",
  );

  const [hasRoute, setHasRoute] = useState(false);
  const [route, setRoute] = useState<Route | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);

  const startFloorOptions = useMemo(
    () => getFloorOptions(buildingFloorOptions, startBuilding),
    [buildingFloorOptions, startBuilding],
  );
  const endFloorOptions = useMemo(
    () => getFloorOptions(buildingFloorOptions, endBuilding),
    [buildingFloorOptions, endBuilding],
  );

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    })();
  }, []);

  const startLocation = useMemo(() => {
    if (!startBuilding || !startFloor) return null;
    const key = `${startBuilding}|${startFloor}`;
    return startEndLocations.get(key) || null;
  }, [startBuilding, startFloor, startEndLocations]);

  const endLocation = useMemo(() => {
    if (!endBuilding || !endFloor) return null;
    const key = `${endBuilding}|${endFloor}`;
    return startEndLocations.get(key) || null;
  }, [endBuilding, endFloor, startEndLocations]);

  const routePolylines = useMemo(() => {
    if (!route) return undefined;
    return route.graphLocations.slice(1).map((gl) => gl.path);
  }, [route]);

  const showPicker = (
    options: OptionType[],
    currentValue: string | null,
    onSelect: (value: string) => void,
  ) => {
    if (Platform.OS === "ios") {
      const optionLabels = ["Cancel", ...options.map((opt) => opt.label)];
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: optionLabels,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            onSelect(options[buttonIndex - 1].value);
          }
        },
      );
    } else {
      // Android - show alert with options
      Alert.alert("", "", [
        { text: "Cancel", style: "cancel" },
        ...options.map((opt) => ({
          text: opt.label,
          onPress: () => onSelect(opt.value),
        })),
      ]);
    }
  };

  const getDisplayValue = (
    options: OptionType[],
    value: string | null,
    placeholder: string,
  ) => {
    if (!value) return placeholder;
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : placeholder;
  };

  const handleCalculateRoute = () => {
    if (!startLocation || !endLocation) {
      Alert.alert("Error", "Please select both start and end locations");
      return;
    }

    try {
      const comparator = Dijkstra.COMPARATORS.get(tunnellingPreference);
      const calculatedRoute = UWMap.calculateRoute(
        startLocation,
        endLocation,
        comparator,
      );

      if (calculatedRoute) {
        setRoute(calculatedRoute);
        setHasRoute(true);
        setShowDirections(true);
        setShowInput(false);
      } else {
        Alert.alert(
          "No Route Found",
          "No route could be found between the selected locations",
        );
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while calculating the route");
      console.error(error);
    }
  };

  const statsString = (route: Route) => {
    const end = route.graphLocations.at(-1);
    if (!end) return [];
    const time = Math.round(end.time / 60);
    return [
      `Time: ${time === 0 ? "<1" : time}min, Distance: ${Math.round(end.distance ?? 0).toLocaleString()}m`,
      `⬆️${end.floorsAscended} floors, ⬇️ ${end.floorsDescended} floors`,
    ];
  };

  const resetSelections = () => {
    setStartBuilding(null);
    setStartFloor(null);
    setEndBuilding(null);
    setEndFloor(null);
    setHasRoute(false);
    setRoute(null);
    setShowDirections(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Full Screen Map */}
      <WATMapView
        geoJson={geoJson}
        hasRoute={hasRoute}
        route={routePolylines}
        style={styles.map}
        mapType={mapType}
      />

      {/* Current Location Marker */}
      {currentLocation && (
        <View style={styles.currentLocationContainer}>
          <Text style={styles.currentLocationText}>📍 Current Location</Text>
        </View>
      )}

      {/* Floating Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>WaterlooWalks</Text>
        <Text style={styles.subtitle}>UW Tunnel Navigation</Text>
      </View>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.primaryFab]}
          onPress={() => setShowInput(true)}
        >
          <Text style={styles.fabText}>🗺️</Text>
        </TouchableOpacity>

        {hasRoute && (
          <TouchableOpacity
            style={[styles.fab, styles.secondaryFab]}
            onPress={() => setShowDirections(true)}
          >
            <Text style={styles.fabText}>📋</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Input Modal */}
      <Modal
        visible={showInput}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInput(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInput(false)}>
              <Text style={styles.closeButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Plan Route</Text>
            <TouchableOpacity onPress={resetSelections}>
              <Text style={styles.resetButton}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Starting Point</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Building</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    showPicker(buildingOptions, startBuilding, (value) => {
                      setStartBuilding(value);
                      setStartFloor(null);
                    })
                  }
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !startBuilding && styles.placeholder,
                    ]}
                  >
                    {getDisplayValue(
                      buildingOptions,
                      startBuilding,
                      "Select building...",
                    )}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Floor</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    !startBuilding && styles.pickerButtonDisabled,
                  ]}
                  disabled={!startBuilding}
                  onPress={() => {
                    if (startBuilding) {
                      showPicker(startFloorOptions, startFloor, setStartFloor);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !startFloor && styles.placeholder,
                    ]}
                  >
                    {getDisplayValue(
                      startFloorOptions,
                      startFloor,
                      "Select floor...",
                    )}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Destination</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Building</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    showPicker(buildingOptions, endBuilding, (value) => {
                      setEndBuilding(value);
                      setEndFloor(null);
                    })
                  }
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !endBuilding && styles.placeholder,
                    ]}
                  >
                    {getDisplayValue(
                      buildingOptions,
                      endBuilding,
                      "Select building...",
                    )}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Floor</Text>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    !endBuilding && styles.pickerButtonDisabled,
                  ]}
                  disabled={!endBuilding}
                  onPress={() => {
                    if (endBuilding) {
                      showPicker(endFloorOptions, endFloor, setEndFloor);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.pickerButtonText,
                      !endFloor && styles.placeholder,
                    ]}
                  >
                    {getDisplayValue(
                      endFloorOptions,
                      endFloor,
                      "Select floor...",
                    )}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚙️ Preferences</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Map Type</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    showPicker(mapTypeOptions, mapType, (value) =>
                      setMapType(value as "standard" | "satellite" | "hybrid"),
                    )
                  }
                >
                  <Text style={styles.pickerButtonText}>
                    {getDisplayValue(
                      mapTypeOptions,
                      mapType,
                      "Select map type...",
                    )}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tunnelling Preference</Text>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() =>
                    showPicker(
                      Dijkstra.COMPARATOR_OPTIONS,
                      tunnellingPreference,
                      setTunnellingPreference,
                    )
                  }
                >
                  <Text style={styles.pickerButtonText}>
                    {getDisplayValue(
                      Dijkstra.COMPARATOR_OPTIONS,
                      tunnellingPreference,
                      "Select preference...",
                    )}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.calculateButton,
                (!startLocation || !endLocation) &&
                  styles.calculateButtonDisabled,
              ]}
              onPress={handleCalculateRoute}
              disabled={!startLocation || !endLocation}
            >
              <Text style={styles.calculateButtonText}>
                🚀 Let&apos;s Tunnel!
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Directions Modal */}
      <Modal
        visible={showDirections}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDirections(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDirections(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Directions</Text>
            <View style={{ width: 50 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {route && (
              <>
                <View style={styles.statsContainer}>
                  {statsString(route).map((str, index) => (
                    <Text key={index} style={styles.statsText}>
                      {str}
                    </Text>
                  ))}
                </View>
                {route.graphLocations.slice(1).map((graphLocation, idx) => (
                  <DirectionsListItem
                    key={idx}
                    graphLocation={graphLocation}
                    order={idx + 1}
                  />
                ))}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  map: {
    flex: 1,
  },
  currentLocationContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "rgba(0, 122, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 5,
  },
  currentLocationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  titleContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 80,
    zIndex: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  fabContainer: {
    position: "absolute",
    bottom: 40,
    right: 20,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  primaryFab: {
    backgroundColor: "#007AFF",
  },
  secondaryFab: {
    backgroundColor: "#34C759",
  },
  fabText: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  closeButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  resetButton: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    minHeight: 48,
  },
  pickerButtonDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.6,
  },
  pickerButtonText: {
    fontSize: 16,
    color: "#1a1a1a",
    flex: 1,
  },
  placeholder: {
    color: "#9ca3af",
  },
  pickerArrow: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 8,
  },
  calculateButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  calculateButtonDisabled: {
    backgroundColor: "#999",
    shadowOpacity: 0,
    elevation: 0,
  },
  calculateButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 18,
  },
  statsContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
    fontWeight: "500",
  },
});
