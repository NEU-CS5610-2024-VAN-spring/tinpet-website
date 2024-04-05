import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [profilePic, setProfilePic] = useState("");
  const { user: auth0User, getAccessTokenSilently } = useAuth0();
  const [newPet, setNewPet] = useState({
    name: "",
    age: 0,
    breed: "",
    gender: "",
    image: "",
  });

  useEffect(() => {
    const fetchUserAndPets = async () => {
      try {
        const token = await getAccessTokenSilently();

        const auth0UserId = auth0User.sub;
        

        let response = await fetch("http://localhost:8000/api/users", {
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
        });

        const userData = await response.json();

        setUser(userData);

        response = await fetch("http://localhost:8000/api/my-pets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
      const response = await fetch(`http://localhost:8000/api/pets/${pet.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pet),
      });

      if (response.ok) {
        setPets(
          pets.map((p) => {
            if (p.id === pet.id) {
              return { ...pet, isEditing: false };
            }
            return p;
          })
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
      const response = await fetch(`http://localhost:8000/api/pets/${petId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    const { name, value } = event.target;
    setPets(
      pets.map((pet) => {
        if (pet.id === id) {
          return { ...pet, [name]: value };
        }
        return pet;
      })
    );
  };

  const handleAddPet = async () => {
    const token = await getAccessTokenSilently();
    try {
      const response = await fetch("http://localhost:8000/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      const ownerId = userData.id;

      const petData = { ...newPet, ownerId };
      const petResponse = await fetch("http://localhost:8000/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(petData),
      });

      if (petResponse.ok) {
        const addedPet = await petResponse.json();
        setPets([...pets, addedPet]);
        setNewPet({ name: "", age: 0, breed: "", gender: "", image: "" });
      } else {
        throw new Error("Failed to add pet");
      }
    } catch (error) {
      console.error("Error adding pet:", error);
    }
  };

  const handleAddPetFormChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "image" && files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPet({ ...newPet, [name]: reader.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setNewPet({ ...newPet, [name]: value });
    }
  };

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
        name="image"
        placeholder="Image URL"
        value={newPet.image}
        onChange={handleAddPetFormChange}
        className="border p-1 mr-2"
      />
      <input
        type="file"
        name="image"
        onChange={handleAddPetFormChange}
        className="border p-1 mr-2"
      />
      <button
        onClick={handleAddPet}
        className="bg-blue-500 text-white p-1 rounded"
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
            src={user.profilePic || "default_avatar_url"}
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
                    <button onClick={() => handleSaveEdit(pet)}>Save</button>
                  </div>
                ) : (
                  <div>
                    <img
                      className="h-16 w-16 rounded-full object-cover"
                      src={pet.image || "default_pet_image_url"}
                      alt={pet.name}
                    />
                    <p>{pet.name}</p>
                    <p>
                      {pet.breed}, {pet.age} years old
                    </p>
                    <p>{pet.gender}</p>
                    <button onClick={() => handleEditPet(pet)}>Edit</button>
                    <button onClick={() => handleDeletePet(pet.id)}>
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
