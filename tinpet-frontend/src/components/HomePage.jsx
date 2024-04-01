import "tailwindcss/tailwind.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function HomePage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const handleMatchClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
      return;
    }
    navigate("/verify-user");
  };

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

  return (
    <div className="grid grid-cols-4 gap-4 gap-y-16">
      {pets.map((pet) => (
        <div key={pet.id} className="relative group">
          <img
            src={pet.image}
            alt={pet.name}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex justify-center items-center transition-opacity duration-300">
            <div className="text-white text-center">
              <p className="font-bold">{pet.name}</p>
              <p>Breed: {pet.breed}</p>
              <p>Age: {pet.age}</p>
              <p>Gender: {pet.gender}</p>
            </div>
          </div>
          <button
            onClick={handleMatchClick}
            className="w-full bg-blue-500 text-white p-2 hover:bg-blue-700"
          >
            Match!
          </button>
          <button
            className="w-full bg-green-500 text-white p-2 hover:bg-green-700 mt-2"
            onClick={handleMatchClick}
          >
            Login Here
          </button>
        </div>
      ))}
    </div>
  );
}

export default HomePage;
