import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function DetailsPage() {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [userPets, setUserPets] = useState([]);
  const [matchedPets, setMatchedPets] = useState(new Map());
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();

  useEffect(() => {
    fetchPetDetails();
    fetchUserPets();
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`https://assignment-03-77.onrender.com/api/pets/${petId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch pet details');
      const data = await response.json();
      setPetDetails(data);
    } catch (error) {
      console.error("Error fetching pet details:", error.message);
    }
  };

  const fetchUserPets = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("https://assignment-03-77.onrender.com/api/my-pets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUserPets(data);
    } catch (error) {
      console.error("Error fetching user pets:", error.message);
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const handleMatch = async (otherPetId) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    if (petId === otherPetId.toString()) {
      alert("A pet cannot match with itself.");
      return;
    }

    const matchKey = `${petId}-${otherPetId}`;
    if (matchedPets.has(matchKey)) {
      alert("This match already exists.");
      return;
    }

    const token = await getAccessTokenSilently();
    const response = await fetch("https://assignment-03-77.onrender.com/api/matches", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pet1Id: parseInt(petId, 10), pet2Id: parseInt(otherPetId, 10) }),
    });

    if (response.ok) {
      setMatchedPets(new Map(matchedPets.set(matchKey, true)));
      alert("Match created successfully!");
    } else {
      alert("Failed to create match.");
    }
  };

  if (!petDetails) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-5">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold">{petDetails.name}</h2>
        <p>{petDetails.description}</p>
        {userPets.filter(pet => pet.id !== petDetails.id).map(pet => (
          <button key={pet.id} onClick={() => handleMatch(pet.id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Match with {pet.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default DetailsPage;
