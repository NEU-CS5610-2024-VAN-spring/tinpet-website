import "tailwindcss/tailwind.css";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function NavigationBar() {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const handleLoginClick = () => {
    loginWithRedirect();
  };

  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex justify-between items-center text-white">
        <li>
          <Link
            to="/"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Profile
          </Link>
        </li>
        <li>
          <Link
            to="/details"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Details
          </Link>
        </li>
        {isAuthenticated && (
          <li>
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:text-gray-400"
            >
              Logout
            </button>
          </li>
        )}
        {!isAuthenticated && (
          <li>
            <button
              onClick={() => handleLoginClick()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:text-gray-400"
            >
              Login
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

function HomePage() {
  const [pets, setPets] = useState([]);
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    async function fetchPets() {
      try {
        const response = await fetch("http://localhost:8000/api/pets");
        if (!response.ok) {
          throw new Error("Failed to fetch pets");
        }
        const petsData = await response.json();

        const randomPets = getRandomPets(petsData, 8);
        setPets(randomPets);
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    }

    fetchPets();
  }, []);

  const getRandomPets = (petsList, count) => {
    const shuffledPets = petsList.sort(() => 0.5 - Math.random());
    return shuffledPets.slice(0, count);
  };

  const handleMatchClick = (petId) => {
    console.log("Matching petId:", petId);
    if (!petId) {
      console.error("petId is undefined");
      return;
    }
    sessionStorage.setItem("postLoginRedirectPetId", petId.toString());
    loginWithRedirect();
  };

  return (
    <div>
      <NavigationBar />
      <div className="grid grid-cols-4 gap-12 gap-y-24 mt-16">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="relative group rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
          >
            <div className="w-full h-48 bg-yellow-100 flex justify-center items-center overflow-hidden">
              <img
                src={pet.image}
                alt={pet.name}
                className="object-cover w-full h-full rounded-lg"
                style={{ objectPosition: "center 25%" }}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center transition-opacity duration-300">
              <div className="text-white text-center p-4">
                <p className="font-bold">{pet.name}</p>
                <p>Breed: {pet.breed}</p>
                <p>Age: {pet.age}</p>
                <p>Gender: {pet.gender}</p>
                <button
                  onClick={() => handleMatchClick(pet.id)}
                  className="bg-orange-500 text-white p-2 hover:bg-blue-700 mt-2"
                >
                  Match!
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
