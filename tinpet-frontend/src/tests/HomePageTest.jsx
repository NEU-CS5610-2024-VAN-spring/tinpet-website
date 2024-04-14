import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import fetchMock from "fetch-mock-jest";
import HomePage from "../components/HomePage";

jest.mock("@auth0/auth0-react");

describe("HomePage", () => {
  const mockGetAccessTokenSilently = jest.fn();

  beforeEach(() => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("fake_token"),
    });
  });

  afterEach(() => {
    fetchMock.restore();
    jest.clearAllMocks();
  });

  it("fetches pets and user pets on mount when authenticated", async () => {
    fetchMock.get("http://localhost:8000/api/pets/latest", {
      status: 200,
      body: [
        {
          id: 1,
          name: "Rex",
          breed: "Golden Retriever",
          age: 5,
          gender: "Male",
          image: "/images/rex.jpg",
        },
      ],
    });
    fetchMock.get("http://localhost:8000/api/my-pets", {
      headers: {
        Authorization: "Bearer fake_token",
      },
      status: 200,
      body: [
        {
          id: 2,
          name: "Buddy",
          breed: "Labrador",
          age: 3,
          gender: "Male",
          image: "/images/buddy.jpg",
        },
      ],
    });

    render(
      <Auth0Provider>
        <HomePage />
      </Auth0Provider>
    );
    await waitFor(() => expect(screen.getByText("Rex")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Buddy")).toBeInTheDocument());
  });

  it("handles unauthenticated state by prompting login on match click", async () => {
    useAuth0.mockReturnValueOnce({
      isAuthenticated: false,
      loginWithRedirect: jest.fn(),
    });

    fetchMock.get("http://localhost:8000/api/pets/latest", {
      status: 200,
      body: [],
    });
    const { getByText } = render(
      <Auth0Provider>
        <HomePage />
      </Auth0Provider>
    );
    fireEvent.click(getByText("Match!"));
    expect(useAuth0().loginWithRedirect).toHaveBeenCalled();
  });

  it("creates a match successfully", async () => {
    const matchPostSpy = fetchMock.post(
      "http://localhost:8000/api/matches",
      200
    );

    render(
      <Auth0Provider>
        <HomePage />
      </Auth0Provider>
    );
    fireEvent.click(screen.getByText("Match!"));
    await waitFor(() => fireEvent.click(screen.getByText("Confirm Match")));
    expect(matchPostSpy).toHaveBeenCalled();
    expect(screen.getByText("Match created successfully!")).toBeInTheDocument();
  });

  it("handles pet selection change", async () => {
    render(
      <Auth0Provider>
        <HomePage />
      </Auth0Provider>
    );
    const select = screen.getByLabelText("Choose your pet to match:");
    fireEvent.change(select, { target: { value: "2" } });
    expect(select.value).toBe("2");
  });

  it("shows alert if already matched", async () => {
    global.alert = jest.fn();
    fetchMock.getOnce("http://localhost:8000/api/my-pets", {
      headers: {
        Authorization: "Bearer fake_token",
      },
      status: 200,
      body: [
        {
          id: 2,
          name: "Buddy",
          breed: "Labrador",
          age: 3,
          gender: "Male",
          image: "/images/buddy.jpg",
        },
      ],
    });

    render(
      <Auth0Provider>
        <HomePage />
      </Auth0Provider>
    );
    fireEvent.click(screen.getByText("Match!"));
    await waitFor(() => fireEvent.click(screen.getByText("Confirm Match")));
    fireEvent.click(screen.getByText("Match!"));
    await waitFor(() => fireEvent.click(screen.getByText("Confirm Match")));
    expect(alert).toHaveBeenCalledWith(
      "You have already matched with this pet."
    );
  });
});
