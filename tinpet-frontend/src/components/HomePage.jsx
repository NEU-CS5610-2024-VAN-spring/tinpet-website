import React, { useState, useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AnimalFacts from "./AnimalFacts";
import Modal from "./Modal";

function HomePage() {
  const [pets, setPets] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetIdForMatch, setSelectedPetIdForMatch] = useState("");
  const [petToMatch, setPetToMatch] = useState(null);
  const [matchedPets, setMatchedPets] = useState(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently } =
    useAuth0();

  useEffect(() => {
    fetchPets();
    if (isAuthenticated) {
      fetchUserPets();
    }
  }, [isAuthenticated]);

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

  const fetchUserPets = useCallback(async () => {
    const token = await getAccessTokenSilently();
    const response = await fetch(
      "https://assignment-03-77.onrender.com/api/my-pets",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setUserPets(data);
  }, [getAccessTokenSilently]);

  const handleMatchClick = (petId) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    
    setPetToMatch(petId.toString());
    
    if (userPets.length > 1) {
      setIsModalOpen(true);
    } else if (userPets.length === 1) {
      const userPetId = userPets[0].id.toString();
      if (userPetId === petId.toString()) {
        alert("You cannot match a pet with itself.");
      } else {
        setSelectedPetIdForMatch(userPetId);
        handleConfirmMatch();
      }
    }
  };

  const handleConfirmMatch = () => {
    if (!selectedPetIdForMatch || !petToMatch || selectedPetIdForMatch === petToMatch) {
      alert("Please make sure you have selected different pets to match.");
      return;
    }
  
    const matchKey = `${selectedPetIdForMatch}-${petToMatch}`;
    if (matchedPets.has(matchKey)) {
      alert("You have already matched these pets.");
      return;
    }
  
    createMatch(selectedPetIdForMatch, petToMatch);
    setIsModalOpen(false);
  };

  const createMatch = async (userPetId, otherPetId) => {
    const token = await getAccessTokenSilently();
    userPetId = parseInt(userPetId, 10);
    otherPetId = parseInt(otherPetId, 10);
  
    const response = await fetch(
      "https://assignment-03-77.onrender.com/api/matches",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pet1Id: userPetId,
          pet2Id: otherPetId,
        }),
      }
    );
  
    if (response.ok) {
      setMatchedPets(
        new Map(
          matchedPets.set(`${userPetId}-${otherPetId}`, true)
        )
      );
      alert("Match created successfully!");
      setSelectedPetIdForMatch("");
      setPetToMatch(null);
    } else {
      const error = await response.json();
      alert(`Failed to create match: ${error.message}`);
    }
  };

  const handlePetSelectionChange = (e) => {
    setSelectedPetIdForMatch(e.target.value);
  };

  return (
    <div className="relative">
      <div
        className="flex justify-center items-center text-center text-6xl lg:text-8xl font-bold text-gray-600 py-4 bg-cover bg-center h-40"
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
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Choose Your Pet"
        onConfirm={handleConfirmMatch}
        pets={userPets}
        selectedPetId={selectedPetIdForMatch}
        onPetSelect={handlePetSelectionChange}
      />
      <AnimalFacts />
    </div>
  );
}

export default HomePage;
