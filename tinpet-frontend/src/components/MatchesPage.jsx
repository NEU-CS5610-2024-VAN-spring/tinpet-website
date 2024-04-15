import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchMatches() {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:8000/api/matches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const filteredMatches = data.filter(
          (match) => match.pet1.id !== match.pet2.id
        );
        setMatches(filteredMatches);
      } else {
        console.error("Failed to fetch matches");
      }
    }

    fetchMatches();
  }, [getAccessTokenSilently]);

  return (
    <div className="container mx-auto px-4 py-5">
      <h2 className="text-2xl font-semibold text-center mb-6">My Matches</h2>
      <div className="space-y-6">
        {matches.map((match, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 grid grid-cols-2 gap-4"
          >
            <div className="flex flex-col items-center">
              <h3 className="font-bold text-lg">Pet 1:</h3>
              <img
                src={
                  match.pet1.image.startsWith("http")
                    ? match.pet1.image
                    : `http://localhost:8000${match.pet1.image}`
                }
                alt={match.pet1.name}
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
              />
              <p className="mt-2">
                <strong>Name:</strong> {match.pet1.name}
              </p>
              <p>
                <strong>Breed:</strong> {match.pet1.breed}
              </p>
              <p>
                <strong>Age:</strong> {match.pet1.age} years old
              </p>
              <p>
                <strong>Gender:</strong> {match.pet1.gender}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="font-bold text-lg">Pet 2:</h3>
              <img
                src={
                  match.pet2.image.startsWith("http")
                    ? match.pet2.image
                    : `http://localhost:8000${match.pet2.image}`
                }
                alt={match.pet2.name}
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
              />
              <p className="mt-2">
                <strong>Name:</strong> {match.pet2.name}
              </p>
              <p>
                <strong>Breed:</strong> {match.pet2.breed}
              </p>
              <p>
                <strong>Age:</strong> {match.pet2.age} years old
              </p>
              <p>
                <strong>Gender:</strong> {match.pet2.gender}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchesPage;
