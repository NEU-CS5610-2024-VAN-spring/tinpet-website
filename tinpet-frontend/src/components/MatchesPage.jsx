import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const token = await getAccessTokenSilently();
    const response = await fetch(
      "https://assignment-03-77.onrender.com/api/matches",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      const data = await response.json();
      setMatches(data);
    } else {
      console.error("Failed to fetch matches");
    }
  };

  const deleteMatch = async (matchId) => {
    const token = await getAccessTokenSilently();
    const response = await fetch(
      `https://assignment-03-77.onrender.com/api/matches/${matchId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.ok) {
      setMatches(matches.filter((match) => match.id !== matchId));
      alert("Match deleted successfully!");
    } else {
      alert("Failed to delete match.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-5">
      <h2 className="text-2xl font-semibold text-center mb-6">My Matches</h2>
      <div className="space-y-6">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-lg shadow-md p-6 grid grid-cols-2 gap-4"
          >
            <div className="flex flex-col items-center">
              <h3 className="font-bold text-lg">Pet 1:</h3>
              <img
                src={
                  match.pet1.image.startsWith("http")
                    ? match.pet1.image
                    : `https://assignment-03-77.onrender.com${match.pet1.image}`
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
                    : `https://assignment-03-77.onrender.com${match.pet2.image}`
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
            <button
              onClick={() => deleteMatch(match.id)}
              className="col-span-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete Match
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchesPage;
