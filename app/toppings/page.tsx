"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Toppings() {
  const [toppings, setToppings] = useState<{ name: string }[]>([]);
  const [newTopping, setNewTopping] = useState("");
  const [error, setError] = useState("");
  const [editingTopping, setEditingTopping] = useState<{ name: string } | null>(
    null
  );
  const [updatedTopping, setUpdatedTopping] = useState("");

  useEffect(() => {
    fetchToppings();
  }, []);

  const fetchToppings = async () => {
    const { data, error } = await supabase.from("toppings").select("*");
    if (error) console.error("Error fetching toppings:", error);
    else setToppings(data);
  };

  const addTopping = async () => {
    const lowerCaseTopping = newTopping.toLowerCase();
    if (toppings.some((t) => t.name === lowerCaseTopping)) {
      setError("Topping already exists.");
      return;
    }
    const { error } = await supabase
      .from("toppings")
      .insert([{ name: lowerCaseTopping }]);
    if (error) console.error("Error adding topping:", error);
    else {
      setToppings([...toppings, { name: lowerCaseTopping }]);
      setNewTopping("");
      setError("");
    }
  };

  const deleteTopping = async (name: string) => {
    const { error } = await supabase.from("toppings").delete().eq("name", name);
    if (error) console.error("Error deleting topping:", error);
    else setToppings(toppings.filter((t) => t.name !== name));
  };

  const updateTopping = async () => {
    if (!editingTopping) return;

    const lowerCaseUpdatedTopping = updatedTopping.toLowerCase();
    if (toppings.some((t) => t.name === lowerCaseUpdatedTopping)) {
      setError("Topping already exists.");
      return;
    }

    const { error } = await supabase
      .from("toppings")
      .update({ name: lowerCaseUpdatedTopping })
      .eq("name", editingTopping.name);

    if (error) console.error("Error updating topping:", error);
    else {
      setToppings(
        toppings.map((t) =>
          t.name === editingTopping.name ? { name: lowerCaseUpdatedTopping } : t
        )
      );
      setEditingTopping(null);
      setUpdatedTopping("");
      setError("");
    }
  };

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
