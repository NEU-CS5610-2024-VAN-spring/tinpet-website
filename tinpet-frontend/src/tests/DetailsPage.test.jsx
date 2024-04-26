import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router-dom";
import DetailsPage from "../components/DetailsPage";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
}));

const pets = [
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

const userPets = [
  {
    id: 1,
    name: "Buddy",
    owner: "userId"
  }
];

const mockGetAccessTokenSilently = jest.fn(() => Promise.resolve("mocked_token"));

beforeEach(() => {
  useParams.mockReturnValue({ petId: '1' });
  useAuth0.mockReturnValue({
    isAuthenticated: true,
    getAccessTokenSilently: mockGetAccessTokenSilently,
    user: { sub: 'userId' },
  });

  global.fetch = jest.fn((url) => {
    if (url === `https://assignment-03-77.onrender.com/api/pets/1`) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(pets[0]),
      });
    } else if (url === "https://assignment-03-77.onrender.com/api/pets") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(pets) });
    } else if (url === "https://assignment-03-77.onrender.com/api/my-pets") {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(userPets) });
    }
    return Promise.reject(new Error(`URL not mocked: ${url}`));
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test("displays pet details correctly", async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:petId" element={<DetailsPage />} />
        </Routes>
      </MemoryRouter>
    );
  });

  expect(await screen.findByText("Buddy")).toBeInTheDocument();
  expect(await screen.findByText(/Golden Retriever/)).toBeInTheDocument();
  expect(await screen.findByText("Age: 3")).toBeInTheDocument();
});

test("displays all pets when no petId is provided", async () => {
  useParams.mockReturnValue({});
  await act(async () => {
    render(
      <MemoryRouter initialEntries={["/pets"]}>
        <Routes>
          <Route path="/pets" element={<DetailsPage />} />
        </Routes>
      </MemoryRouter>
    );
  });

  expect(await screen.findByText("Buddy")).toBeInTheDocument();
  expect(await screen.findByText("Charlie")).toBeInTheDocument();
});

test("filters pets by name and gender", async () => {
  useParams.mockReturnValue({});
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/pets']}>
        <Routes>
          <Route path="/pets" element={<DetailsPage />} />
        </Routes>
      </MemoryRouter>
    );
  });

  fireEvent.change(screen.getByPlaceholderText('Search pets...'), { target: { value: 'Charlie' } });
  fireEvent.change(screen.getByText('All Genders'), { target: { value: 'Female' } });

  await waitFor(() => {
    expect(screen.queryByText('Buddy')).not.toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });
});
