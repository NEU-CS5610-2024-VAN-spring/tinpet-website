import React, { useState, useEffect } from "react";
import "tailwindcss/tailwind.css";

function HomePage() {
  const [pets, setPets] = useState([]);

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
    <div className="grid grid-cols-2 gap-4">
      {pets.map((pet) => (
        <div
          key={pet.id}
          className="card bg-white rounded-lg overflow-hidden shadow-md"
        >
          <img
            src={pet.image}
            alt={pet.name}
            className="object-cover object-center h-full w-full"
          />
          <div className="p-4">
            <h5 className="text-lg font-bold mb-2">{pet.name}</h5>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HomePage;
