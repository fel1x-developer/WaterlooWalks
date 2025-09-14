import { render } from "@testing-library/react-native";
import { Slot } from "expo-router";
import RootLayout from "../../app/_layout";

// Mock expo-router's Slot component
jest.mock("expo-router", () => ({
  Slot: jest.fn(() => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, { testID: "slot" });
  }),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render without crashing", () => {
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeTruthy();
  });

  it("should render the Slot component", () => {
    render(<RootLayout />);
    expect(Slot).toHaveBeenCalled();
  });

  it("should match snapshot", () => {
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toMatchSnapshot();
  });
});
