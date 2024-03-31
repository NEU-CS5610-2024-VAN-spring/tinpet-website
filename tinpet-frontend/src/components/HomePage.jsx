import React, { useState, useEffect, useCallback } from "react";

function HomePage() {
  const [pets, setPets] = useState([]);

  const catApiUrl = `https://placekitten.com/300/300`;
  const dogApiUrl = `https://dog.ceo/api/breeds/image/random`;

  const fetchRandomPetImage = useCallback(async () => {
    try {
      const isCat = Math.random() > 0.5;
      const apiUrl = isCat ? catApiUrl : dogApiUrl;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }

      const data = isCat ? { message: apiUrl } : await response.json();
      return data.message;
    } catch (error) {
      console.error(error);
      return fetchRandomPetImage();
    }
  }, [catApiUrl, dogApiUrl]);

  const fetchRandomPetName = async () => {
    try {
      const response = await fetch("/generate-pet-name");
      const result = await response.json();
      return result.name;
    } catch (error) {
      console.error("Failed to fetch pet name:", error);
      return "Unknown";
    }
  };

  useEffect(() => {
    async function loadPets() {
      const petData = await Promise.all(
        Array.from({ length: 10 }, async () => {
          const image = await fetchRandomPetImage();
          const name = await fetchRandomPetName();
          return { image, name };
        })
      );

      setPets(
        petData.map((pet, index) => ({
          id: index,
          name: pet.name,
          image: pet.image,
        }))
      );
    }

    loadPets();
  }, [fetchRandomPetImage]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {pets.map((pet) => (
        <div key={pet.id} className="card">
          <img src={pet.image} alt={pet.name} className="card-img" />
          <div className="card-body">
            <h5 className="card-title">{pet.name}</h5>
          </div>
        </div>
      ))}
    </div>
  );
}

export default HomePage;
