"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [toppings, setToppings] = useState<{ name: string }[]>([]);
  const [newTopping, setNewTopping] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white">
      <h1 className="text-2xl mb-4">Manage Pizza Toppings</h1>
      <ul className="mb-4">
        {toppings.map((topping) => (
          <li
            key={topping.name}
            className="flex justify-between items-center border-b border-white py-2"
          >
            {topping.name}
            <button
              onClick={() => deleteTopping(topping.name)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newTopping}
        onChange={(e) => setNewTopping(e.target.value)}
        className="border border-white rounded p-2 mb-2"
        placeholder="Add new topping"
      />
      <button onClick={addTopping} className="bg-white text-black rounded p-2">
        Add Topping
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
