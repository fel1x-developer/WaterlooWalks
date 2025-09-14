import React from "react";
import { render } from "@testing-library/react-native";
import DirectionsListItem from "../../src/components/DirectionsListItem";
import { GraphLocation } from "../../src/algorithm/dijkstra";
import { Coordinate, BuildingFloor, Location } from "../../src/algorithm/types";

// Create mock GraphLocation objects for testing
const createMockGraphLocation = (
  buildingCode: string,
  floor: string,
  distance: number,
  time: number,
  directionsString: string = `Go to ${buildingCode} floor ${floor}`,
): GraphLocation => {
  const coordinate = new Coordinate([-80.5422, 43.4723]);
  const buildingFloor = new BuildingFloor({ buildingCode, floor });
  const location = new Location(coordinate, buildingFloor);

  return {
    location,
    distance,
    time,
    floorsAscended: 0,
    floorsDescended: 0,
    path: [] as [number, number][],
    prevLocation: null,
    travelMode: null,
    timeOutside: 0,
    floorChange: 0,
    toDirectionsString: () => directionsString,
  } as GraphLocation;
};

describe("DirectionsListItem", () => {
  it("should render direction text and order", () => {
    const previousGraphLocation = createMockGraphLocation("MC", "1", 0, 0);
    const currentGraphLocation = createMockGraphLocation(
      "MC",
      "2",
      50,
      120,
      "Go to MC floor 2",
    );

    const { getByText } = render(
      <DirectionsListItem
        graphLocation={currentGraphLocation}
        previousGraphLocation={previousGraphLocation}
        order={1}
      />,
    );

    expect(getByText("1")).toBeTruthy();
    expect(getByText("Go to MC floor 2")).toBeTruthy();
  });

  it("should show distance when segment distance is greater than 0", () => {
    const previousGraphLocation = createMockGraphLocation("MC", "1", 0, 0);
    const currentGraphLocation = createMockGraphLocation("MC", "2", 75, 120);

    const { getByText } = render(
      <DirectionsListItem
        graphLocation={currentGraphLocation}
        previousGraphLocation={previousGraphLocation}
        order={1}
      />,
    );

    expect(getByText("75m")).toBeTruthy();
  });

  it("should not show distance when segment distance is 0", () => {
    const previousGraphLocation = createMockGraphLocation("MC", "1", 50, 0);
    const currentGraphLocation = createMockGraphLocation("MC", "2", 50, 120);

    const { queryByText } = render(
      <DirectionsListItem
        graphLocation={currentGraphLocation}
        previousGraphLocation={previousGraphLocation}
        order={1}
      />,
    );

    expect(queryByText("0m")).toBeNull();
  });

  it("should round distance to nearest meter", () => {
    const previousGraphLocation = createMockGraphLocation("MC", "1", 0, 0);
    const currentGraphLocation = createMockGraphLocation("MC", "2", 47.6, 120);

    const { getByText } = render(
      <DirectionsListItem
        graphLocation={currentGraphLocation}
        previousGraphLocation={previousGraphLocation}
        order={2}
      />,
    );

    expect(getByText("48m")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
  });
});
