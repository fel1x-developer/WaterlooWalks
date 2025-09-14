import "@testing-library/jest-native/extend-expect";

// Mock react-native-maps since it requires native dependencies
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    __esModule: true,
    default: (props: any) =>
      React.createElement(View, { ...props, testID: "MapView" }),
    Marker: (props: any) =>
      React.createElement(View, { ...props, testID: "Marker" }),
    Polyline: (props: any) =>
      React.createElement(View, { ...props, testID: "Polyline" }),
    PROVIDER_GOOGLE: "google",
  };
});

// Mock @react-native-picker/picker
jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    Picker: (props: any) =>
      React.createElement(View, { ...props, testID: "Picker" }),
  };
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
