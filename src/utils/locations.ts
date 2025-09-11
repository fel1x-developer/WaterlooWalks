import { Coordinate, BuildingFloor, Location } from "../algorithm/types";
import buildings from "../geojson/buildings.json";

export type OptionType = {
  value: string;
  label: string;
};

export function getStartEndLocations() {
  return new Map<string, Location>(
    buildings.features
      .map((building) =>
        building.properties.building.floors.map((floor) => {
          const buildingCode = building.properties.building.buildingCode;
          return [
            new BuildingFloor({ buildingCode, floor }).toString(),
            new Location(
              new Coordinate(building.geometry.coordinates as [number, number]),
              new BuildingFloor({ buildingCode, floor }),
            ),
          ] as [string, Location];
        }),
      )
      .flat(),
  );
}

export function getBuildingFloorOptions() {
  const map = new Map<string, string[]>();
  buildings.features.forEach((building) => {
    const buildingCode = building.properties.building.buildingCode;
    map.set(
      buildingCode,
      (map.get(buildingCode) ?? []).concat(building.properties.building.floors),
    );
  });
  map.forEach((value) => value.sort());
  return map;
}

export function getBuildingOptions(
  buildingFloorOptions: Map<string, string[]>,
) {
  const arr = Array.from(buildingFloorOptions.keys()).map((building) => {
    return { value: building, label: building };
  });
  arr.sort((a, b) => a.value.localeCompare(b.value));
  return arr;
}

export function getFloorOptions(
  buildingFloorOptions: Map<string, string[]>,
  buildingValue: string | null,
) {
  return buildingValue == null
    ? []
    : (buildingFloorOptions.get(buildingValue) ?? []).map((floor) => {
        return { value: floor, label: floor };
      });
}
