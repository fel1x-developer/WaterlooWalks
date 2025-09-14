import {
  getStartEndLocations,
  getBuildingFloorOptions,
  getBuildingOptions,
  getFloorOptions,
} from "../../src/utils/locations";

describe("locations utilities", () => {
  describe("getStartEndLocations", () => {
    it("should return a map with building-floor combinations", () => {
      const locations = getStartEndLocations();

      expect(locations).toBeInstanceOf(Map);
      expect(locations.size).toBeGreaterThan(0);

      // Check if keys follow the pattern "BUILDING|FLOOR"
      const firstKey = Array.from(locations.keys())[0];
      expect(firstKey).toMatch(/^[A-Z0-9]+\|[A-Z0-9]+$/);
    });

    it("should create location objects with valid coordinates", () => {
      const locations = getStartEndLocations();
      const firstLocation = Array.from(locations.values())[0];

      expect(firstLocation).toBeDefined();
      expect(firstLocation.coordinate).toBeDefined();
      expect(typeof firstLocation.coordinate.latitude).toBe("number");
      expect(typeof firstLocation.coordinate.longitude).toBe("number");
    });
  });

  describe("getBuildingFloorOptions", () => {
    it("should return a map of building codes to floor arrays", () => {
      const buildingFloors = getBuildingFloorOptions();

      expect(buildingFloors).toBeInstanceOf(Map);
      expect(buildingFloors.size).toBeGreaterThan(0);

      const firstBuilding = Array.from(buildingFloors.keys())[0];
      const floors = buildingFloors.get(firstBuilding);

      expect(floors).toBeInstanceOf(Array);
      expect(floors!.length).toBeGreaterThan(0);
    });

    it("should sort floors for each building", () => {
      const buildingFloors = getBuildingFloorOptions();

      buildingFloors.forEach((floors) => {
        const sortedFloors = [...floors].sort();
        expect(floors).toEqual(sortedFloors);
      });
    });
  });

  describe("getBuildingOptions", () => {
    it("should return sorted array of building options", () => {
      const buildingFloors = getBuildingFloorOptions();
      const options = getBuildingOptions(buildingFloors);

      expect(options).toBeInstanceOf(Array);
      expect(options.length).toBeGreaterThan(0);

      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
      });

      // Check if sorted
      const values = options.map((o) => o.value);
      const sortedValues = [...values].sort();
      expect(values).toEqual(sortedValues);
    });
  });

  describe("getFloorOptions", () => {
    let buildingFloors: Map<string, string[]>;

    beforeEach(() => {
      buildingFloors = getBuildingFloorOptions();
    });

    it("should return empty array when buildingValue is null", () => {
      const options = getFloorOptions(buildingFloors, null);
      expect(options).toEqual([]);
    });

    it("should return empty array for non-existent building", () => {
      const options = getFloorOptions(buildingFloors, "NON_EXISTENT");
      expect(options).toEqual([]);
    });

    it("should return floor options for valid building", () => {
      const firstBuilding = Array.from(buildingFloors.keys())[0];
      const options = getFloorOptions(buildingFloors, firstBuilding);

      expect(options).toBeInstanceOf(Array);
      expect(options.length).toBeGreaterThan(0);

      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
      });
    });
  });
});
