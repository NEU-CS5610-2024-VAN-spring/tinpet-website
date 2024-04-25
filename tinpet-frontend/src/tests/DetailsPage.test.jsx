import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import DetailsPage from "../components/DetailsPage";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: jest.fn(),
}));

const mockGetAccessTokenSilently = jest.fn();

beforeEach(() => {
  useAuth0.mockReturnValue({
    isAuthenticated: true,
    getAccessTokenSilently: mockGetAccessTokenSilently,
  });
  mockGetAccessTokenSilently.mockResolvedValue("fake-token");
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

const setup = (initialRoute = "/pets") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/pets/:petId" element={<DetailsPage />} />
        <Route path="/pets" element={<DetailsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

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
test("fetches and displays pet details when petId is provided", async () => {
    useParams.mockReturnValue({ petId: "1" });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPets[0],
    });
  
    setup("/pets/1");
  
    await waitFor(() => {
      expect(screen.getByText("Buddy")).toBeInTheDocument();
      expect(screen.getByText("Golden Retriever")).toBeInTheDocument();
      expect(screen.getByText("Age: 3")).toBeInTheDocument();
      expect(screen.getByText("Gender: Male")).toBeInTheDocument();
    });
  });
  
  test("fetches and displays all pets when no petId is provided", async () => {
    useParams.mockReturnValue({});
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPets,
    });
  
    setup();
  
    await waitFor(() => {
      expect(screen.getByText("Buddy")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });
  });
  