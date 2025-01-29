"use client";

import Link from "next/link";
import { useToppings } from "../../hooks/useToppings";

export default function Toppings() {
  const {
    toppings,
    newTopping,
    error,
    editingTopping,
    updatedTopping,
    setNewTopping,
    setEditingTopping,
    setUpdatedTopping,
    addTopping,
    deleteTopping,
    updateTopping,
  } = useToppings();

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white max-w-[800px] mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/" className="text-blue-500 mr-4">
          ← Back
        </Link>
        <h1 className="text-2xl">Manage Pizza Toppings</h1>
      </div>
      <ul className="mb-4">
        {toppings.map((topping) => (
          <li
            key={topping.name}
            className="flex justify-between items-center border-b border-white py-2"
          >
            {topping.name}
            <div>
              <button
                onClick={() => {
                  setEditingTopping(topping);
                  setUpdatedTopping(topping.name);
                }}
                className="text-blue-500 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTopping(topping.name)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {editingTopping ? (
        <div>
          <input
            type="text"
            value={updatedTopping}
            onChange={(e) => setUpdatedTopping(e.target.value)}
            className="border border-white rounded p-2 mb-2 mr-2 text-black"
            placeholder="Update topping"
          />
          <button
            onClick={updateTopping}
            className="bg-white text-black rounded p-2"
          >
            Update Topping
          </button>
          <button
            onClick={() => {
              setEditingTopping(null);
              setUpdatedTopping("");
            }}
            className="text-gray-500 ml-2"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={newTopping}
            onChange={(e) => setNewTopping(e.target.value)}
            className="border border-white rounded p-2 mb-2 mr-2 text-black"
            placeholder="Add new topping"
          />
          <button
            onClick={addTopping}
            className="bg-white text-black rounded p-2"
          >
            Add Topping
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
