import "tailwindcss/tailwind.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function HomePage() {
  const [pets, setPets] = useState([]);
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPets() {
      try {
        const response = await fetch("http://localhost:8000/api/pets/latest");
        if (!response.ok) {
          throw new Error("Failed to fetch pets");
        }
        const petsData = await response.json();
        setPets(petsData);
      } catch (error) {
        console.error("Error fetching pets:", error);
      }
    }

    fetchPets();
  }, []);

  const handleMatchClick = (petId) => {
    if (isAuthenticated) {
      navigate(`/details/${petId}`);
    } else {
      sessionStorage.setItem("postLoginRedirectPetId", petId.toString());
      loginWithRedirect();
    }
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-12 gap-y-24 mt-16">
        {pets.map((pet) => (
          <div
            key={pet.id}
            className="relative group rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
          >
            <div className="w-full h-48 bg-yellow-100 flex justify-center items-center overflow-hidden">
              <img
                src={
                  pet.image && pet.image.startsWith("http")
                    ? pet.image
                    : `http://localhost:8000${pet.image}`
                }
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
