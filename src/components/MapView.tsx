import React, { useMemo } from "react";
import MapView, { Polyline, Region } from "react-native-maps";
import { StyleSheet } from "react-native";
import { GeoJson, GeoJsonLine } from "../algorithm/types";

interface WATMapViewProps {
  geoJson: GeoJson;
  hasRoute: boolean;
  route?: [number, number][][];
  style?: any;
  mapType?: "standard" | "satellite" | "hybrid";
}

const UW_CAMPUS_REGION: Region = {
  latitude: 43.4713,
  longitude: -80.5448,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const getPolylineColor = (
  pathType: Exclude<GeoJsonLine["properties"]["type"], "walkway">,
): string => {
  switch (pathType) {
    case "tunnel":
      return "#0066CC";
    case "bridge":
      return "#CC6600";
    case "hallway":
      return "#666666";
  }
};

export default function WATMapView({
  geoJson,
  hasRoute,
  route,
  style,
  mapType = "standard",
}: WATMapViewProps) {
  const basePolylines = useMemo(() => {
    return (
      geoJson.features.filter(
        (f) =>
          f.geometry.type === "LineString" && f.properties.type !== "walkway",
      ) as GeoJsonLine[]
    ).map((feature, index) => ({
      id: `base-${index}`,
      coordinates: feature.geometry.coordinates.map(
        (coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }),
      ),
      strokeColor: getPolylineColor(
        feature.properties.type as Exclude<
          GeoJsonLine["properties"]["type"],
          "walkway"
        >,
      ),
      strokeWidth: 3,
      strokeOpacity: hasRoute ? 0.25 : 1,
    }));
  }, [geoJson, hasRoute]);

  const routePolylines = useMemo(() => {
    if (!route) return [];

    return route.map((pathCoords, index) => ({
      id: `route-${index}`,
      coordinates: pathCoords.map((coord) => ({
        latitude: coord[1],
        longitude: coord[0],
      })),
      strokeColor: "#FF0000",
      strokeWidth: 4,
    }));
  }, [route]);

  return (
    <MapView
      style={[styles.map, style]}
      initialRegion={UW_CAMPUS_REGION}
      mapType={mapType}
    >
      {basePolylines.map((polyline) => (
        <Polyline
          key={polyline.id}
          coordinates={polyline.coordinates}
          strokeColor={polyline.strokeColor}
          strokeWidth={polyline.strokeWidth}
        />
      ))}

      {routePolylines.map((polyline) => (
        <Polyline
          key={polyline.id}
          coordinates={polyline.coordinates}
          strokeColor={polyline.strokeColor}
          strokeWidth={polyline.strokeWidth}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
