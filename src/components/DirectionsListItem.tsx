import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GraphLocation } from "../algorithm/dijkstra";

interface DirectionsListItemProps {
  graphLocation: GraphLocation;
  order: number;
}

export default function DirectionsListItem({
  graphLocation,
  order,
}: DirectionsListItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.orderContainer}>
        <Text style={styles.orderText}>{order}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.directionText}>
          {graphLocation.toDirectionsString()}
        </Text>
        {graphLocation.distance > 0 && (
          <Text style={styles.distanceText}>
            {Math.round(graphLocation.distance)}m
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  directionText: {
    fontSize: 16,
    color: "#1a1a1a",
    marginBottom: 4,
    fontWeight: "500",
  },
  distanceText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
});
