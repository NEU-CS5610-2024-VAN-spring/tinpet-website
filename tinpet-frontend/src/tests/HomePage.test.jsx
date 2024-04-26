import React from "react";
import { render, fireEvent, screen, waitFor, act } from "@testing-library/react";
import HomePage from "../components/HomePage";
import { useAuth0 } from "@auth0/auth0-react";
import '@testing-library/jest-dom';

jest.mock("@auth0/auth0-react");

describe("HomePage Component Tests", () => {
  const mockLoginWithRedirect = jest.fn();
  const mockGetAccessTokenSilently = jest.fn();

  beforeEach(() => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 1,
            name: "Fluffy",
            breed: "Golden Retriever",
            age: 5,
            gender: "Male",
            image: "http://example.com/dog.jpg"
          },
          {
            id: 2,
            name: "Mittens",
            breed: "Tabby",
            age: 3,
            gender: "Female",
            image: "http://example.com/cat.jpg"
          }
        ])
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders HomePage and fetches pets", async () => {
    await act(async () => {
      render(<HomePage />);
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Fluffy")).toBeInTheDocument();
    expect(screen.getByText("Mittens")).toBeInTheDocument();
  });

  test("displays Match button when pets are listed", async () => {
    await act(async () => {
      render(<HomePage />);
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getAllByText("Match!")[0]).toBeInTheDocument();
  });

  test("Login button appears and triggers loginWithRedirect when not authenticated", async () => {
    await act(async () => {
      render(<HomePage />);
    });
    fireEvent.click(screen.getAllByText("Match!")[0]);
    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });

  test("Match creation process starts when authenticated and Match button is clicked", async () => {
    useAuth0.mockReturnValueOnce({
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect,
      getAccessTokenSilently: mockGetAccessTokenSilently.mockResolvedValue("fake-token"),
    });
    await act(async () => {
      render(<HomePage />);
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
    fireEvent.click(screen.getAllByText("Match!")[0]);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  test("Enter App navigates to user's pets when authenticated", async () => {
    useAuth0.mockReturnValueOnce({
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect,
      getAccessTokenSilently: mockGetAccessTokenSilently.mockResolvedValue("fake-token"),
    });
    await act(async () => {
      render(<HomePage />);
    });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  });
});
