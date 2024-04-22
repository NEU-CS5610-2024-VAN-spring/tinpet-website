import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AnimalFacts from "./AnimalFacts";

function HomePage() {
  const [pets, setPets] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetIdForMatch, setSelectedPetIdForMatch] = useState("");
  const [petToMatch, setPetToMatch] = useState(null);
  const [matchedPets, setMatchedPets] = useState(new Map());
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  const fetchUserPets = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        "https://assignment-03-77.onrender.com/api/my-pets",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setUserPets(data);
    } catch (error) {
      console.error("Failed to fetch user pets:", error);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch(
          "https://assignment-03-77.onrender.com/api/pets/latest"
        );
        const petsData = await response.json();
        setPets(petsData);
      } catch (error) {
        console.error("Failed to fetch pets:", error);
      }
    };

    fetchPets();
    if (isAuthenticated) {
      fetchUserPets();
    }
  }, [isAuthenticated, fetchUserPets]);

  const handleMatchClick = (otherPetId) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    if (userPets.length === 0) {
      alert("You do not have any pets to match.");
      return;
    }

    // If the user has more than one pet and hasn't selected one yet, prompt them.
    if (userPets.length > 1 && selectedPetIdForMatch === null) {
      alert("Please select one of your pets to match.");
      return;
    }

    // Prevent a pet from matching with itself.
    if (selectedPetIdForMatch === otherPetId) {
      alert("A pet cannot match with itself. Please select a different pet.");
      return;
    }

    // Check for an existing match to avoid duplicates.
    const matchKey = `${selectedPetIdForMatch}-${otherPetId}`;
    if (matchedPets.has(matchKey)) {
      alert("You have already matched with this pet.");
    } else {
      createMatch(selectedPetIdForMatch, otherPetId);
    }
  };

  const createMatch = async (userPetId, otherPetId) => {
    const matchKey = `${userPetId}-${otherPetId}`;

    if (userPetId === otherPetId) {
      alert("Error: A pet cannot match with itself.");
      return;
    }

    if (matchedPets.has(matchKey)) {
      alert("You have already matched these pets.");
      return;
    }

    const token = await getAccessTokenSilently();
    const response = await fetch(
      "https://assignment-03-77.onrender.com/api/matches",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pet1Id: userPetId, pet2Id: otherPetId }),
      }
    );

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
    <div className="relative">
      <div
        className="flex justify-center items-center text-center text-6xl lg:text-8xl font-bold text-gray-600 py-4 bg-cover bg-center h-40" // Tailwind classes for centering and font size
        style={{
          backgroundImage:
            "url('https://t3.ftcdn.net/jpg/00/84/55/66/360_F_84556601_W71hd1xmCxZUhsscyNlokY1an7Kqx6ZJ.jpg')",
          height: "280px",
          fontFamily: "Great Vibes",
        }}
      >
        Welcome to Pet Matcher
      </div>
      <div className="grid grid-cols-4 gap-12 gap-y-24 mt-16">
        {pets.length === 0 ? (
          <div>No pets available</div>
        ) : (
          pets.map((pet) => (
            <div
              key={pet.id}
              className="relative group rounded-lg overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
            >
              <div className="w-full h-48 bg-yellow-100 flex justify-center items-center overflow-hidden">
                <img
                  src={
                    pet.image && pet.image.startsWith("http")
                      ? pet.image
                      : `https://assignment-03-77.onrender.com${pet.image}`
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
          ))
        )}
      </div>
      {userPets.length > 1 && (
        <div className="mt-4">
          <label htmlFor="pet-select">Choose your pet to match:</label>
          <select
            id="pet-select"
            value={selectedPetIdForMatch}
            onChange={handlePetSelectionChange}
            className="ml-2 border p-2"
          >
            <option value="">Select a Pet</option>
            {userPets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleConfirmMatch}
            className="bg-blue-500 text-white p-2 ml-4"
            disabled={!selectedPetIdForMatch || !petToMatch}
          >
            Confirm Match
          </button>
        </div>
      )}
      <AnimalFacts />
    </div>
  );
}

export default HomePage;
