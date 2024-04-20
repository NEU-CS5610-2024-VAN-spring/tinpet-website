import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function DetailsPage() {
  const { petId } = useParams();
  const [petDetails, setPetDetails] = useState(null);
  const [allPets, setAllPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [filteredPets, setFilteredPets] = useState([]);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    async function fetchDetails() {
      try {
        const token = await getAccessTokenSilently();
        let url = `https://assignment-03-77.onrender.com/api/pets${
          petId ? `/${petId}` : ""
        }`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Data received from API:", data);

        if (petId) {
          setPetDetails(data);
        } else {
          setAllPets(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    }
    fetchDetails();
  }, [petId, getAccessTokenSilently]);

  useEffect(() => {
    if (Array.isArray(allPets)) {
      const filtered = allPets.filter(
        (pet) =>
          (pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pet.breed.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (!searchGender ||
            pet.gender.toLowerCase() === searchGender.toLowerCase())
      );
      setFilteredPets(filtered);
    }
  }, [searchTerm, searchGender, allPets]);

  function formatImageUrl(image) {
    return image && !image.startsWith("http")
      ? `https://assignment-03-77.onrender.com${image}`
      : image;
  }

  if (!petId && allPets.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Pets</h1>
        <input
          type="text"
          placeholder="Search by name or breed..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <select
          value={searchGender}
          onChange={(e) => setSearchGender(e.target.value)}
          className="mb-4 p-2 border border-gray-300 rounded"
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded-lg shadow overflow-hidden"
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
                <p className="text-gray-600">Breed: {pet.breed}</p>
                <p className="text-gray-600">Age: {pet.age}</p>
                <p className="text-gray-600">Gender: {pet.gender}</p>
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
          </div>
        </div>
      </div>
    );
  } else {
    return <div className="text-center py-8">Loading...</div>;
  }
}

export default DetailsPage;
