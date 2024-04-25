import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Modal from "./Modal";

function DetailsPage() {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [allPets, setAllPets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPetIdForMatch, setSelectedPetIdForMatch] = useState("");
  const [petToMatch, setPetToMatch] = useState(null);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    fetchPets();
  }, [getAccessTokenSilently, isAuthenticated]);

  async function fetchPets() {
    try {
      const token = await getAccessTokenSilently();
      let url = petId
        ? `https://assignment-03-77.onrender.com/api/details/${petId}`
        : `https://assignment-03-77.onrender.com/api/details`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (petId) {
        setPetDetails(data);
      } else {
        setAllPets(data);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    }
  }

  const handleMatchClick = (id) => {
    if (!isAuthenticated) {
      loginwithRedirect();
      return;
    }
    setPetToMatch(id.toString());
    setIsModalOpen(true);
  };

  const handleConfirmMatch = async () => {
    if (!selectedPetIdForMatch || selectedPetIdForMatch === petToMatch) {
      alert(
        "Invalid match. Please select a different pet or check your selection."
      );
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://assignment-03-77.onrender.com/api/matches`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            pet1Id: parseInt(selectedPetIdForMatch, 10),
            pet2Id: parseInt(petToMatch, 10),
          }),
        }
      );

      if (response.ok) {
        alert("Match created successfully!");
        setIsModalOpen(false);
        fetchPets(); // Optionally refresh pets list
      } else {
        const errorData = await response.json();
        alert(`Failed to create match: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating match:", error);
      alert("Error creating match.");
    }
  };

  if (!petId && allPets.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Pets</h1>
        {allPets.map((pet) => (
          <div
            key={pet.id}
            className="bg-white rounded-lg shadow overflow-hidden my-4 p-4"
          >
            <h2 className="text-xl font-semibold text-gray-700">{pet.name}</h2>
            <p>{pet.breed}</p>
            <p>{pet.age} years old</p>
            <p>{pet.gender}</p>
            <button
              onClick={() => handleMatchClick(pet.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Match with My Pet
            </button>
          </div>
        ))}
      </div>
    );
  } else if (petDetails) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl my-8">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:h-full md:w-48"
              src={petDetails.image} // Ensure your image URLs are correct
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
              onClick={() => handleMatchClick(petDetails.id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Match with My Pet
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return <div className="text-center py-8">Loading...</div>;
  }
}

export default DetailsPage;
