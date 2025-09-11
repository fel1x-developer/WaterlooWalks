export class Coordinate {
  readonly latitude: number;
  readonly longitude: number;

  constructor(arr: [number, number]) {
    this.latitude = arr[1];
    this.longitude = arr[0];
  }

  equals(other: Coordinate) {
    return (
      this.latitude === other.latitude && this.longitude === other.longitude
    );
  }

  toArray(): [number, number] {
    return [this.longitude, this.latitude];
  }
}

export class BuildingFloor {
  readonly buildingCode: string;
  readonly floor: string;

  constructor({
    buildingCode,
    floor,
  }: {
    buildingCode: string;
    floor: string;
  }) {
    this.buildingCode = buildingCode;
    this.floor = floor;
  }

  equals(other: BuildingFloor) {
    return (
      this.buildingCode === other.buildingCode && this.floor === other.floor
    );
  }

  toString() {
    return `${this.buildingCode}|${this.floor}`;
  }

  toDirectionString() {
    return `${this.buildingCode} floor ${this.floor}`;
  }
}

export class Location {
  readonly coordinate: Coordinate;
  readonly buildingFloor: BuildingFloor;

  constructor(coordinate: Coordinate, buildingFloor: BuildingFloor) {
    this.coordinate = coordinate;
    this.buildingFloor = buildingFloor;
  }

  toString(): string {
    return (
      `${this.coordinate.latitude}|${this.coordinate.longitude}|` +
      `${this.buildingFloor.buildingCode}|${this.buildingFloor.floor}`
    );
  }

  equals(other: Location) {
    return (
      this.coordinate.equals(other.coordinate) &&
      this.buildingFloor.equals(other.buildingFloor)
    );
  }
}

export class Edge {
  readonly start: Location;
  readonly end: Location;
  readonly length: number;
  /**
   *  Number of floors up/down (a signed integer)
   */
  readonly floorChange: number;
  readonly type: string;
  readonly coordinates: [number, number][];

  constructor(
    start: Location,
    end: Location,
    length: number,
    floorChange: number,
    type: string,
    coordinates: [number, number][],
  ) {
    this.start = start;
    this.end = end;
    this.length = length;
    this.floorChange = floorChange;
    this.type = type;
    this.coordinates = coordinates;
  }
}

export interface BuildingFloorData {
  buildingCode: string;
  floor: string;
}

export type GeoJsonLine = {
  type: "Feature";
  properties: {
    type: "hallway" | "bridge" | "tunnel" | "walkway";
    start: BuildingFloorData;
    end: BuildingFloorData;
  };
  geometry: {
    coordinates: [number, number][];
    type: "LineString";
  };
  id?: string;
};
export type GeoJsonStairs = {
  type: "Feature";
  properties: {
    type: "stairs";
    connections: (BuildingFloorData & { level: number })[];
  };
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  id?: string;
};
export type GeoJsonDoorOrOpen = {
  type: "Feature";
  properties: {
    type: "door" | "open";
    start: BuildingFloorData;
    end: BuildingFloorData;
  };
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
  id?: string;
};
export type GeoJsonBuilding = {
  type: "Feature";
  properties: {
    type: "building";
    building: {
      buildingCode: string;
      floors: string[];
    };
  };
  geometry: {
    coordinates: [number, number];
    type: "Point";
  };
};
export type GeoJson = {
  features: (GeoJsonLine | GeoJsonStairs | GeoJsonDoorOrOpen)[];
  type: "FeatureCollection";
};
