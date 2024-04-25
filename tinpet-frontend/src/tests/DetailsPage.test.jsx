import React from "react";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { act } from "react-dom/test-utils";
import { useAuth0 } from "@auth0/auth0-react";
import DetailsPage from "../components/DetailsPage";

jest.mock("@auth0/auth0-react");

const mockGetAccessTokenSilently = jest.fn().mockResolvedValue("fake-token");

const mockPets = [
  {
    id: 1,
    name: "Buddy",
    age: 3,
    breed: "Golden Retriever",
    gender: "Male",
    image: "/path/to/image1.jpg",
  },
  {
    id: 2,
    name: "Charlie",
    age: 5,
    breed: "Labrador",
    gender: "Female",
    image: "/path/to/image2.jpg",
  },
];

describe("DetailsPage Component", () => {
  beforeEach(() => {
    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isAuthenticated: true,
    });

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/pets/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPets[0]),
        });
      } else if (url.includes("/api/pets")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPets),
        });
      }
      return Promise.reject(new Error("Endpoint not mocked"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetches and displays pet details", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/pets/1"]}>
          <Routes>
            <Route path="/pets/:petId" element={<DetailsPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await act(async () => {
      await waitFor(() => {
        expect(screen.findByText("Buddy")).resolves.toBeInTheDocument();
        expect(
          screen.findByText("Golden Retriever")
        ).resolves.toBeInTheDocument();
        expect(screen.findByText("Age: 3")).resolves.toBeInTheDocument();
        expect(screen.findByText("Gender: Male")).resolves.toBeInTheDocument();
      });
    });
  });

  test("fetches and displays all pets when no petId is provided", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/pets"]}>
          <Routes>
            <Route path="/pets" element={<DetailsPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    await act(async () => {
      await waitFor(() => {
        expect(screen.getByText("Buddy")).toBeInTheDocument();
        expect(screen.getByText("Charlie")).toBeInTheDocument();
      });
    });
  });

  test("searches and filters pets", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/pets"]}>
          <Routes>
            <Route path="/pets" element={<DetailsPage />} />
          </Routes>
        </MemoryRouter>
      );
    });

    const searchInput = screen.getByPlaceholderText(
      "Search by name or breed..."
    );
    fireEvent.change(searchInput, { target: { value: "Buddy" } });

    await act(async () => {
      await waitFor(() => {
        expect(screen.getByText("Buddy")).toBeInTheDocument();
        expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
      });
    });
  });
});
describe("DetailsPage Component", () => {
  beforeEach(() => {
    useAuth0.mockReturnValue({
      getAccessTokenSilently: mockGetAccessTokenSilently,
      isAuthenticated: true,
    });

    global.fetch = jest.fn((url) => {
      if (url.includes("/api/pets/1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPets[0]),
        });
      } else if (url.includes("/api/pets")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPets),
        });
      }
      return Promise.reject(new Error("Endpoint not mocked"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetches and displays pet details", async () => {
    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:petId" element={<DetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Buddy")).toBeInTheDocument();
    expect(await screen.findByText("Golden Retriever")).toBeInTheDocument();
    expect(await screen.findByText("Age: 3")).toBeInTheDocument();
    expect(await screen.findByText("Gender: Male")).toBeInTheDocument();
  });

  test("fetches and displays all pets when no petId is provided", async () => {
    render(
      <MemoryRouter initialEntries={["/pets"]}>
        <Routes>
          <Route path="/pets" element={<DetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Buddy")).toBeInTheDocument();
    expect(await screen.findByText("Charlie")).toBeInTheDocument();
  });

  test("searches and filters pets", async () => {
    render(
      <MemoryRouter initialEntries={["/pets"]}>
        <Routes>
          <Route path="/pets" element={<DetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText("Search by name or breed...");
    fireEvent.change(searchInput, { target: { value: "Buddy" } });

    expect(await screen.findByText("Buddy")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });
});