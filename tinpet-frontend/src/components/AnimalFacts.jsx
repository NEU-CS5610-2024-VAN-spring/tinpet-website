import React, { useState } from "react";

function AnimalDetails({ data }) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 m-4">
      <h2 className="text-xl font-bold mb-2">
        {data.name} ({data.taxonomy.scientific_name})
      </h2>
      <p>
        <strong>Location:</strong> {data.locations.join(", ")}
      </p>
      <p>
        <strong>Habitat:</strong> {data.characteristics.habitat}
      </p>
      <p>
        <strong>Diet:</strong> {data.characteristics.diet}
      </p>
      <p>
        <strong>Lifespan:</strong> {data.characteristics.lifespan}
      </p>
      <p>
        <strong>Top Speed:</strong> {data.characteristics.top_speed}
      </p>
      <p>
        <strong>Notable Feature:</strong>{" "}
        {data.characteristics.most_distinctive_feature}
      </p>
      <div className="mt-4">
        <h3 className="font-semibold">Taxonomy:</h3>
        <ul className="list-disc ml-4">
          <li>Kingdom: {data.taxonomy.kingdom}</li>
          <li>Phylum: {data.taxonomy.phylum}</li>
          <li>Class: {data.taxonomy.class}</li>
          <li>Order: {data.taxonomy.order}</li>
          <li>Family: {data.taxonomy.family}</li>
          <li>Genus: {data.taxonomy.genus}</li>
        </ul>
      </div>
    </div>
  );
}

function AnimalFacts() {
  const [animal, setAnimal] = useState("");
  const [facts, setFacts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      fetchAnimalFacts();
    }
  };

  const fetchAnimalFacts = async () => {
    setIsLoading(true);
    const url = `https://animals-by-api-ninjas.p.rapidapi.com/v1/animals?name=${animal}`;
    try {
      const response = await fetch(url, {
        headers: {
          "X-RapidAPI-Key":
            "5c4ee685c5msh15f5fb7e04144bfp154e2fjsn3fd6631e30ff",
          "X-RapidAPI-Host": "animals-by-api-ninjas.p.rapidapi.com",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch the facts: ${response.status}`);
      }

      const data = await response.json();
      setFacts(data.length > 0 ? data : "No facts found for this animal.");
    } catch (error) {
      console.error("Error:", error);
      setFacts("No facts found. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <input
        type="text"
        id="search-input"
        value={animal}
        onChange={(e) => setAnimal(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter an animal name"
        className="border border-gray-300 rounded-md p-2 w-full"
      />
      <button
        onClick={fetchAnimalFacts}
        disabled={isLoading}
        className={`mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Loading..." : "Get Facts"}
      </button>
      <div className="mt-4">
        {facts === null ? (
          <p className="text-center text-gray-600">
            Enter an animal name to get interesting facts.
          </p>
        ) : typeof facts === "string" ? (
          <p className="text-center text-red-500">{facts}</p>
        ) : (
          facts.map((fact, index) => <AnimalDetails key={index} data={fact} />)
        )}
      </div>
    </div>
  );
}

export default AnimalFacts;
