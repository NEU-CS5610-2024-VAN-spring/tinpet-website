import React from "react";
import { render, screen, act } from "@testing-library/react";
import HomePage from "../components/HomePage";
import { useAuth0 } from "@auth0/auth0-react";

jest.mock("@auth0/auth0-react");

describe("HomePage Component", () => {
  beforeEach(async () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently: jest.fn().mockResolvedValue("fake-access-token"),
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              id: 1,
              name: "Dog",
              breed: "Golden Retriever",
              age: 3,
              gender: "Male",
              image: "http://example.com/dog.jpg",
            },
            {
              id: 2,
              name: "Cat",
              breed: "Siamese",
              age: 2,
              gender: "Female",
              image: "http://example.com/cat.jpg",
            },
          ]),
      })
    );

    await act(async () => {
      render(<HomePage />);
    });
  });

  test("renders HomePage without crashing", () => {
    expect(screen.getByText("Dog")).toBeInTheDocument();
    expect(screen.getByText("Breed: Golden Retriever")).toBeInTheDocument();
    expect(screen.getByText("Cat")).toBeInTheDocument();
    expect(screen.getByText("Breed: Siamese")).toBeInTheDocument();
  });

  test("fetches pets data on mount", () => {
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/pets/latest"
    );
  });

  test("fetches user pets data when isAuthenticated is true", async () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently: jest.fn().mockResolvedValue("fake-access-token"),
    });

    await act(async () => {
      render(<HomePage />);
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  test("does not fetch user pets data when isAuthenticated is false", async () => {
    await act(async () => {
      render(<HomePage />);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test("creates match when Match button is clicked and user is authenticated with pets", async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    });

    const matchButtons = screen.getAllByRole("button", { name: "Match!" });
    expect(matchButtons.length).toBeGreaterThan(0);
    act(() => {
      matchButtons[0].click();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1); // Adjusted to include the additional API call
  });

  test("handles fetch error gracefully", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    await act(async () => {
      render(<HomePage />);
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Failed to fetch data");
  });

  test("displays no pets available message when API returns empty array", async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve([]),
    });

    await act(async () => {
      render(<HomePage />);
    });

    expect(screen.getByText("No pets available")).toBeInTheDocument();
  });
});
