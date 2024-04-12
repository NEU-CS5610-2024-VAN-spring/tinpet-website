import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function HomePage() {
  const [pets, setPets] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetIdForMatch, setSelectedPetIdForMatch] = useState(null);
  const [petToMatch, setPetToMatch] = useState(null);
  const [matchedPets, setMatchedPets] = useState(new Map());
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    fetchPets();
    if (isAuthenticated) {
      fetchUserPets();
    }
  }, [isAuthenticated]);

  async function fetchPets() {
    const response = await fetch("http://localhost:8000/api/pets/latest");
    const petsData = await response.json();
    setPets(petsData);
  }

  async function fetchUserPets() {
    const token = await getAccessTokenSilently();
    const response = await fetch("http://localhost:8000/api/my-pets", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setUserPets(data);
  }

  const handleMatchClick = (otherPetId) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    setPetToMatch(otherPetId);

    if (userPets.length === 0) {
      alert("You do not have any pets to match.");
      return;
    }

    if (userPets.length === 1) {
      setSelectedPetIdForMatch(userPets[0].id); // Default selection for single pet
      if (!matchedPets.has(userPets[0].id + "-" + otherPetId)) {
        createMatch(userPets[0].id, otherPetId);
      } else {
        alert("You have already matched with this pet.");
      }
    } else {
      setSelectedPetIdForMatch(userPets[0].id); // Default selection
    }
  };

  const createMatch = async (userPetId, otherPetId) => {
    const matchKey = userPetId + "-" + otherPetId;
    if (matchedPets.has(matchKey)) {
      alert("You have already matched these pets.");
      return;
    }

    const token = await getAccessTokenSilently();
    const response = await fetch("http://localhost:8000/api/matches", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pet1Id: userPetId, pet2Id: otherPetId }),
    });

    if (response.ok) {
      setMatchedPets(new Map(matchedPets.set(matchKey, true)));
      alert("Match created successfully!");
    } else {
      alert("Failed to create match.");
    }

    setSelectedPetIdForMatch(null);
    setPetToMatch(null);
  };

  const handlePetSelectionChange = (e) => {
    setSelectedPetIdForMatch(e.target.value);
  };

  const handleConfirmMatch = () => {
    if (matchedPets.has(selectedPetIdForMatch + "-" + petToMatch)) {
      alert("You have already matched with this pet.");
    } else {
      createMatch(selectedPetIdForMatch, petToMatch);
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
      {userPets.length > 1 && petToMatch && (
        <div className="mt-4">
          <label htmlFor="pet-select">Choose your pet to match:</label>
          <select
            id="pet-select"
            value={selectedPetIdForMatch}
            onChange={handlePetSelectionChange}
            className="ml-2 border p-2"
          >
            {userPets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleConfirmMatch}
            className="bg-blue-500 text-white p-2 ml-4"
          >
            Confirm Match
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
