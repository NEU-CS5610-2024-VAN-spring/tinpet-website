import React from "react";

function Modal({
  isOpen,
  onClose,
  title,
  onConfirm,
  pets,
  selectedPetId,
  onPetSelect,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <header className="flex justify-between items-center border-b pb-3">
          <h4 className="text-lg font-bold">{title}</h4>
          <button
            onClick={onClose}
            className="text-black font-semibold text-xl"
          >
            X
          </button>
        </header>
        <div className="my-4">
          <select
            value={selectedPetId}
            onChange={onPetSelect}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a Pet</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name}
              </option>
            ))}
          </select>
        </div>
        <footer className="flex justify-end">
          <button
            onClick={onConfirm}
            disabled={!selectedPetId}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Confirm Match
          </button>
        </footer>
      </div>
    </div>
  );
}

export default Modal;
