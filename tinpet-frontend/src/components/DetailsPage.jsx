import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Modal from "./Modal";

function DetailsPage() {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [allPets, setAllPets] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [selectedPetIdForMatch, setSelectedPetIdForMatch] = useState("");
  const [petToMatch, setPetToMatch] = useState(null);
  const [matchedPets, setMatchedPets] = useState(new Map());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userPets, setUserPets] = useState([]);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    fetchPets();
    fetchUserPets();
  }, [getAccessTokenSilently, isAuthenticated]);

  useEffect(() => {
    const filtered = allPets.filter((pet) => {
      return (
        pet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterGender ? pet.gender === filterGender : true)
      );
    });
    setFilteredPets(filtered);
  }, [searchTerm, filterGender, allPets]);

  async function fetchPets() {
    const token = await getAccessTokenSilently();
    const url = petId
      ? `https://assignment-03-77.onrender.com/api/pets/${petId}`
      : `https://assignment-03-77.onrender.com/api/pets`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    petId ? setPetDetails(data) : setAllPets(data);
  }

  async function fetchUserPets() {
    const token = await getAccessTokenSilently();
    const response = await fetch(
      "https://assignment-03-77.onrender.com/api/my-pets",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    setUserPets(data);
  }

  const handleMatchClick = (petId) => {
    const newPetId = petId.toString();
    setPetToMatch(newPetId);

    if (userPets.length === 1) {
      const userPetId = userPets[0].id.toString();
      if (userPetId !== newPetId) {
        setSelectedPetIdForMatch(userPetId);
      }
    } else if (userPets.length > 1) {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    if (petToMatch && selectedPetIdForMatch) {
      if (petToMatch === selectedPetIdForMatch) {
        alert("Please make sure you have selected different pets to match.");
        setPetToMatch(null);
        setSelectedPetIdForMatch("");
      } else {
        handleConfirmMatch();
      }
    }
  }, [petToMatch, selectedPetIdForMatch]);

  const handleConfirmMatch = () => {
    if (
      !selectedPetIdForMatch ||
      !petToMatch ||
      selectedPetIdForMatch === petToMatch
    ) {
      alert("Please make sure you have selected different pets to match.");
      return;
    }

    if (userPets.some((pet) => pet.id.toString() === petToMatch)) {
      alert(
        "You cannot match a pet with itself or with another of your own pets."
      );
      setPetToMatch(null);
      setSelectedPetIdForMatch("");
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
    const matchKey = `${userPetId}-${otherPetId}`;

    if (matchedPets.has(matchKey)) {
      alert("This match has already been created.");
      return;
    }

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
      setMatchedPets(new Map(matchedPets.set(matchKey, true)));
      alert("Match created successfully!");
      setSelectedPetIdForMatch("");
      setPetToMatch(null);
    } else {
      const error = await response.json();
      alert(`Failed to create match: ${error.message}`);
    }
  };

  const formatImageUrl = (image) => {
    return image && !image.startsWith("http")
      ? `https://assignment-03-77.onrender.com${image}`
      : image;
  };

  if (!petId && allPets.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Pets</h1>
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search pets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded"
          />
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-lg shadow overflow-hidden group transform transition duration-300 hover:scale-105"
            >
              <img
                src={formatImageUrl(pet.image)}
                alt={pet.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-700">
                  {pet.name}
                </h2>
                <p>{pet.breed}</p>
                <p>{pet.age} years old</p>
                <p>{pet.gender}</p>
                <button
                  onClick={() => handleMatchClick(pet.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 mt-2"
                >
                  Match with My Pet
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (petDetails) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden md:max-w-2xl my-8">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img
              className="h-48 w-full object-cover md:h-full md:w-48"
              src={formatImageUrl(petDetails.image)}
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
