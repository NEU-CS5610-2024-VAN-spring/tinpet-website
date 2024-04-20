import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const { user: auth0User, getAccessTokenSilently } = useAuth0();
  const fileInputRef = useRef(null);
  const [newPet, setNewPet] = useState({
    name: "",
    age: 0,
    breed: "",
    gender: "",
    imageUrl: "", // Separate image URL for adding a new pet
    imageFile: null, // Separate image file for adding a new pet
  });

  useEffect(() => {
    const fetchUserAndPets = async () => {
      try {
        const token = await getAccessTokenSilently();
        if (!auth0User) {
          return;
        }
        const auth0UserId = auth0User.sub;

        let response = await fetch(
          "https://assignment-03-77.onrender.com/api/users",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              auth0Id: auth0UserId,
              email: auth0User.email,
              name: auth0User.name,
            }),
          }
        );

        const userData = await response.json();

        setUser(userData);

        response = await fetch(
          "https://assignment-03-77.onrender.com/api/my-pets",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const petsData = await response.json();
        setPets(petsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserAndPets();
  }, [auth0User, getAccessTokenSilently]);

  const handleEditPet = (pet) => {
    setPets(
      pets.map((p) => {
        if (p.id === pet.id) {
          return { ...p, isEditing: true };
        }
        return p;
      })
    );
  };

  const handleSaveEdit = async (pet) => {
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("name", pet.name);
      formData.append("age", pet.age);
      formData.append("breed", pet.breed);
      formData.append("gender", pet.gender);

      // Append image data only if there's a new file or an explicitly set URL
      if (pet.imageFile) {
        formData.append("image", pet.imageFile);
      } else if (pet.imageUrl) {
        formData.append("imageUrl", pet.imageUrl); // Ensure imageUrl is only set if not empty
      }

      const response = await fetch(
        `https://assignment-03-77.onrender.com/api/pets/${pet.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedPet = await response.json();
        setPets(
          pets.map((p) =>
            p.id === updatedPet.id
              ? { ...p, ...updatedPet, isEditing: false }
              : p
          )
        );
      } else {
        throw new Error("Failed to update pet");
      }
    } catch (error) {
      console.error("Error updating pet:", error);
    }
  };

  const handleDeletePet = async (petId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `https://assignment-03-77.onrender.com/api/pets/${petId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setPets(pets.filter((pet) => pet.id !== petId));
      } else {
        throw new Error("Failed to delete pet");
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  const handleChange = (id, event) => {
    const { name, value, files } = event.target;

    setPets(
      pets.map((existingPet) => {
        if (existingPet.id === id) {
          let updatedPet = { ...existingPet, [name]: value };

          if (name === "imageFile" && files && files.length > 0) {
            updatedPet.imageFile = files[0];
            updatedPet.imageUrl = "";
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } else if (name === "imageUrl") {
            updatedPet.imageUrl = value;
            updatedPet.imageFile = null;
          }

          return updatedPet;
        }
        return existingPet;
      })
    );
  };

  const handleAddPet = async () => {
    const token = await getAccessTokenSilently();
    try {
      const formData = new FormData();
      formData.append("name", newPet.name);
      formData.append("age", newPet.age);
      formData.append("breed", newPet.breed);
      formData.append("gender", newPet.gender);
      if (newPet.imageFile) {
        formData.append("image", newPet.imageFile);
      } else {
        formData.append("imageUrl", newPet.imageUrl);
      }
      formData.append("ownerId", user.id);

      const response = await fetch(
        "https://assignment-03-77.onrender.com/api/pets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const addedPet = await response.json();
        setPets([...pets, addedPet]);
        setNewPet({
          name: "",
          age: 0,
          breed: "",
          gender: "",
          imageUrl: "",
          imageFile: null,
        });
      } else {
        throw new Error("Failed to add pet");
      }
    } catch (error) {
      console.error("Error adding pet:", error);
    }
  };

  const handleAddPetFormChange = (event) => {
    const { name, value, files } = event.target;

    // When a file is selected
    if (name === "imageFile" && files) {
      setNewPet((prevNewPet) => ({
        ...prevNewPet,
        imageFile: files[0], // Update the file
        imageUrl: "", // Clear the imageUrl
      }));
    }
    // When a URL is provided
    else if (name === "imageUrl") {
      setNewPet((prevNewPet) => ({
        ...prevNewPet,
        imageUrl: value, // Update the imageUrl
        imageFile: null, // Clear the file
      }));
    }
    // For all other inputs
    else {
      setNewPet((prevNewPet) => ({
        ...prevNewPet,
        [name]: value, // Only update the changed field
      }));
    }
  };

  // This is the form for adding a new pet
  const addPetForm = (
    <div className="my-4">
      <h3 className="text-lg font-semibold mb-2">Add New Pet</h3>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={newPet.name}
        onChange={handleAddPetFormChange}
        className="border p-1 mr-2"
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        value={newPet.age}
        onChange={handleAddPetFormChange}
        className="border p-1 mr-2"
      />
      <input
        type="text"
        name="breed"
        placeholder="Breed"
        value={newPet.breed}
        onChange={handleAddPetFormChange}
        className="border p-1 mr-2"
      />
      <select
        name="gender"
        value={newPet.gender}
        onChange={handleAddPetFormChange}
        className="border p-1 mr-2"
      >
        <option value="">Select Gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      <input
        type="text"
        name="imageUrl"
        placeholder="Image URL"
        value={newPet.imageUrl}
        onChange={handleAddPetFormChange}
        className="border p-1 mr-2"
      />
      <input
        type="file"
        name="imageFile"
        onChange={handleAddPetFormChange}
        ref={fileInputRef}
        className="border p-1 mr-2"
      />
      <button
        onClick={handleAddPet}
        className="bg-blue-500 text-white p-1 rounded w-20"
      >
        Add Pet
      </button>
    </div>
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        {addPetForm}
        <div className="flex items-center space-x-6 mb-4">
          <img
            className="h-24 w-24 rounded-full object-cover"
            src={
              user.profilePic ||
              "https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png"
            }
            alt="Profile"
          />
          <div>
            <p className="text-xl text-gray-800">{user.name}</p>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg text-gray-800">My Pets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-gray-100 rounded-lg p-4">
                {pet.isEditing ? (
                  <div>
                    <img
                      className="h-16 w-16 rounded-full object-cover mb-4"
                      src={
                        pet.imageUrl // Check if imageUrl input is not empty
                          ? pet.imageUrl // Show new imageUrl if it's not empty
                          : pet.image && !pet.image.startsWith("http")
                          ? `https://assignment-03-77.onrender.com${pet.image}`
                          : pet.image ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG01veQWF8uwTv__jmxyH2hM-oKPJc7S0l04GVeuYAPA&s" // Fall back to the existing image or a default
                      }
                      alt={pet.name}
                    />
                    <input
                      type="text"
                      name="name"
                      value={pet.name}
                      onChange={(e) => handleChange(pet.id, e)}
                    />
                    <input
                      type="number"
                      name="age"
                      value={pet.age}
                      onChange={(e) => handleChange(pet.id, e)}
                    />
                    <input
                      type="text"
                      name="breed"
                      value={pet.breed}
                      onChange={(e) => handleChange(pet.id, e)}
                    />
                    <select
                      name="gender"
                      value={pet.gender}
                      onChange={(e) => handleChange(pet.id, e)}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <input
                      type="text"
                      name="imageUrl"
                      placeholder="Image URL"
                      value={pet.imageUrl || ""}
                      onChange={(e) => handleChange(pet.id, e)}
                      className="border p-1 mr-2"
                    />
                    <input
                      type="file"
                      name="imageFile"
                      onChange={(e) => handleChange(pet.id, e)}
                      className="border p-1 mr-2"
                    />
                    <button
                      onClick={() => handleSaveEdit(pet)}
                      className="bg-green-500 text-white p-1 mr-2 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className="bg-red-500 text-white p-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div>
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={
                        pet.image && !pet.image.startsWith("http")
                          ? `https://assignment-03-77.onrender.com${pet.image}`
                          : pet.image ||
                            pet.imageUrl ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG01veQWF8uwTv__jmxyH2hM-oKPJc7S0l04GVeuYAPA&s"
                      }
                      alt={pet.name}
                    />
                    <p>{pet.name}</p>
                    <p>
                      {pet.breed}, {pet.age} years old
                    </p>
                    <p>{pet.gender}</p>
                    <button
                      onClick={() => handleEditPet(pet)}
                      className="bg-green-500 text-white p-1 mr-2 rounded w-20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePet(pet.id)}
                      className="bg-red-500 text-white p-1 rounded w-20"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
