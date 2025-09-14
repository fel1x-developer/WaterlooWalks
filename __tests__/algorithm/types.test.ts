import { Coordinate, BuildingFloor, Location } from "../../src/algorithm/types";

describe("Coordinate", () => {
  it("should create coordinate from array", () => {
    const coord = new Coordinate([-80.5422, 43.4723]);

    expect(coord.latitude).toBe(43.4723);
    expect(coord.longitude).toBe(-80.5422);
  });

  it("should check equality correctly", () => {
    const coord1 = new Coordinate([-80.5422, 43.4723]);
    const coord2 = new Coordinate([-80.5422, 43.4723]);
    const coord3 = new Coordinate([-80.5423, 43.4723]);

    expect(coord1.equals(coord2)).toBe(true);
    expect(coord1.equals(coord3)).toBe(false);
  });

  it("should convert to array correctly", () => {
    const coord = new Coordinate([-80.5422, 43.4723]);
    const array = coord.toArray();

    expect(array).toEqual([-80.5422, 43.4723]);
  });
});

describe("BuildingFloor", () => {
  it("should create building floor object", () => {
    const bf = new BuildingFloor({
      buildingCode: "MC",
      floor: "2",
    });

    expect(bf.buildingCode).toBe("MC");
    expect(bf.floor).toBe("2");
  });

  it("should check equality correctly", () => {
    const bf1 = new BuildingFloor({ buildingCode: "MC", floor: "2" });
    const bf2 = new BuildingFloor({ buildingCode: "MC", floor: "2" });
    const bf3 = new BuildingFloor({ buildingCode: "MC", floor: "3" });
    const bf4 = new BuildingFloor({ buildingCode: "DC", floor: "2" });

    expect(bf1.equals(bf2)).toBe(true);
    expect(bf1.equals(bf3)).toBe(false);
    expect(bf1.equals(bf4)).toBe(false);
  });

  it("should convert to string correctly", () => {
    const bf = new BuildingFloor({ buildingCode: "MC", floor: "2" });

    expect(bf.toString()).toBe("MC|2");
  });

  it("should convert to direction string correctly", () => {
    const bf = new BuildingFloor({ buildingCode: "MC", floor: "2" });

    expect(bf.toDirectionString()).toBe("MC floor 2");
  });
});

describe("Location", () => {
  it("should create location object", () => {
    const coordinate = new Coordinate([-80.5422, 43.4723]);
    const buildingFloor = new BuildingFloor({ buildingCode: "MC", floor: "2" });
    const location = new Location(coordinate, buildingFloor);

    expect(location.coordinate).toBe(coordinate);
    expect(location.buildingFloor).toBe(buildingFloor);
  });

  it("should convert to string correctly", () => {
    const coordinate = new Coordinate([-80.5422, 43.4723]);
    const buildingFloor = new BuildingFloor({ buildingCode: "MC", floor: "2" });
    const location = new Location(coordinate, buildingFloor);

    expect(location.toString()).toBe("43.4723|-80.5422|MC|2");
  });

  it("should check equality correctly", () => {
    const coord1 = new Coordinate([-80.5422, 43.4723]);
    const coord2 = new Coordinate([-80.5422, 43.4723]);
    const coord3 = new Coordinate([-80.5423, 43.4723]);

    const bf1 = new BuildingFloor({ buildingCode: "MC", floor: "2" });
    const bf2 = new BuildingFloor({ buildingCode: "MC", floor: "2" });
    const bf3 = new BuildingFloor({ buildingCode: "DC", floor: "2" });

    const loc1 = new Location(coord1, bf1);
    const loc2 = new Location(coord2, bf2);
    const loc3 = new Location(coord3, bf1);
    const loc4 = new Location(coord1, bf3);

    expect(loc1.equals(loc2)).toBe(true);
    expect(loc1.equals(loc3)).toBe(false);
    expect(loc1.equals(loc4)).toBe(false);
  });
});
