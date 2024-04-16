import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import ProfilePage from "../components/ProfilePage"; // Adjust the import path as necessary
import { useAuth0 } from "@auth0/auth0-react";

jest.mock("@auth0/auth0-react");

describe("ProfilePage Component", () => {
  const mockGetAccessTokenSilently = jest.fn().mockResolvedValue("fake-token");
  const mockUser = {
    email: "test@example.com",
    name: "Test User",
    sub: "auth0|123456",
  };

  beforeEach(() => {
    useAuth0.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    global.fetch = jest.fn((url, options) => {
      if (url.includes("/api/users") && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "1",
              name: mockUser.name,
              email: mockUser.email,
            }),
        });
      }
      if (url.includes("/api/my-pets")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 1,
                name: "Buddy",
                age: 3,
                breed: "Golden Retriever",
                gender: "Male",
                imageUrl: "http://example.com/dog.jpg",
              },
            ]),
        });
      }
      if (url.includes("/api/pets/1") && options.method === "PUT") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              name: "Buddy Updated",
              age: 3,
              breed: "Golden Retriever",
              gender: "Male",
              imageUrl: "http://example.com/dog.jpg",
            }),
        });
      }
      if (url.includes("/api/pets") && options.method === "POST") {
        // Simulate a successful POST request for adding a pet
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 2,
              name: options.body.get("name"),
              age: options.body.get("age"),
              breed: options.body.get("breed"),
              gender: options.body.get("gender"),
              imageUrl: options.body.get("imageUrl"),
            }),
        });
      }
      return Promise.reject(new Error("Endpoint not mocked"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders and fetches user and pets data", async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("Buddy")).toBeInTheDocument();
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  test("handles edit and save pet actions", async () => {
    await act(async () => {
      render(<ProfilePage />);
    });

    // Ensure Buddy is rendered before continuing
    await waitFor(() => expect(screen.getByText("Buddy")).toBeInTheDocument());

    // Simulate user action to edit a pet
    fireEvent.click(screen.getByText("Edit"));

    // Change the name in the input field and save
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Name"), {
        target: { value: "Buddy Updated" },
      });
      fireEvent.click(screen.getByText("Save"));
    });

    // Assertions to check if the fetch was called correctly and the UI updated
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/pets/1"), // Ensure this matches the actual request URL
        expect.objectContaining({
          method: "PUT",
          body: expect.any(FormData), // Ensure your component sends the right type of data
        })
      );
      expect(screen.getByText("Buddy Updated")).toBeInTheDocument();
    });
  });

  test("handles adding a new pet", async () => {
    await act(async () => {
      render(<ProfilePage />);
    });
    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "New Pet" },
    });
    fireEvent.change(screen.getByPlaceholderText("Age"), {
      target: { value: 1 },
    });
    fireEvent.change(screen.getByPlaceholderText("Breed"), {
      target: { value: "Labrador" },
    });
    fireEvent.change(screen.getByPlaceholderText("Image URL"), {
      target: { value: "http://example.com/newpet.jpg" },
    });
    fireEvent.click(screen.getByText("Add Pet"));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/pets",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        })
      );
    });
  });
});
