import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Modal from "./Modal";

function DetailsPage() {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPetIdForMatch, setSelectedPetIdForMatch] = useState("");
  const { isAuthenticated, loginWithRedirect, getAccessTokenSilently, user } = useAuth0();
  const [userPets, setUserPets] = useState([]);

  useEffect(() => {
    fetchDetails();
    if (isAuthenticated) {
      fetchUserPets();
    }
  }, [isAuthenticated, petId, getAccessTokenSilently]);

  async function fetchDetails() {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://assignment-03-77.onrender.com/api/pets/${petId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch pet details.");
      const data = await response.json();
      setPetDetails(data);
    } catch (error) {
      console.error("Error fetching pet details:", error);
    }
  }

  async function fetchUserPets() {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        "https://assignment-03-77.onrender.com/api/my-pets",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setUserPets(data);
    } catch (error) {
      console.error("Failed to fetch user pets:", error);
    }
  }

  const handleMatchClick = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmMatch = async () => {
    if (!selectedPetIdForMatch || !petDetails || selectedPetIdForMatch === petDetails.id.toString()) {
      alert("Please select different pets to match.");
      setIsModalOpen(false);
      return;
    }
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        "https://assignment-03-77.onrender.com/api/matches",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pet1Id: parseInt(selectedPetIdForMatch, 10),
            pet2Id: petDetails.id,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to create match.");
      alert("Match created successfully!");
      setIsModalOpen(false);
    } catch (error) {
      alert(`Failed to create match: ${error.message}`);
    }
  };

  if (!petDetails) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl my-8">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img
            className="h-48 w-full object-cover md:h-full md:w-48"
            src={petDetails.image}
            alt={petDetails.name}
          />
        </div>
        <div className="p-8">
          <h1 className="block mt-1 text-lg leading-tight font-medium text-black">
            {petDetails.name}
          </h1>
          <p className="mt-2 text-gray-500">Age: {petDetails.age}</p>
          <p className="text-gray-500">Breed: {petDetails.breed}</p>
          <p className="text-gray-500">Gender: {petDetails.gender}</p>
          <button
            onClick={handleMatchClick}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Match this Pet
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Choose Your Pet for Match"
        onConfirm={handleConfirmMatch}
        pets={userPets.filter(pet => pet.id !== petDetails.id)}  // Exclude the current pet from selection
        selectedPetId={selectedPetIdForMatch}
        onPetSelect={(e) => setSelectedPetIdForMatch(e.target.value)}
      />
    </div>
  );
}

export default DetailsPage;
