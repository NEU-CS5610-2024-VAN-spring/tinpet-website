import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function DetailsPage() {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchPetDetails() {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(
          `http://localhost:8000/api/pets/${petId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch pet details");
        const data = await response.json();
        setPetDetails(data);
      } catch (error) {
        console.error("Error fetching pet details:", error);
      }
    }

    fetchPetDetails();
  }, [petId, getAccessTokenSilently]);

  if (!petDetails) return <div>Loading...</div>;

  return (
    <div>
      <h1>{petDetails.name}</h1>
      <img src={petDetails.image} alt={petDetails.name} />
      <p>Age: {petDetails.age}</p>
      <p>Breed: {petDetails.breed}</p>
      <p>Gender: {petDetails.gender}</p>
    </div>
  );
}

export default DetailsPage;
