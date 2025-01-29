"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Pizzas() {
  const [pizzas, setPizzas] = useState<
    { id: number; title: string; toppings: string[] }[]
  >([]);
  const [toppings, setToppings] = useState<{ name: string }[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [editingPizza, setEditingPizza] = useState<{
    id: number;
    title: string;
    toppings: string[];
  } | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPizzas();
    fetchToppings();
  }, []);

  const fetchPizzas = async () => {
    const { data, error } = await supabase.from("pizzas").select("*");
    if (error) console.error("Error fetching pizzas:", error);
    else setPizzas(data);
  };

  const fetchToppings = async () => {
    const { data, error } = await supabase.from("toppings").select("*");
    if (error) console.error("Error fetching toppings:", error);
    else setToppings(data);
  };

  const addPizza = async () => {
    if (!title.trim()) {
      setError("Please enter a pizza title.");
      return;
    }

    if (
      pizzas.some((p) => p.title.toLowerCase() === title.toLowerCase().trim())
    ) {
      setError("A pizza with this title already exists.");
      return;
    }

    if (
      pizzas.some(
        (p) =>
          p.toppings.length === selectedToppings.length &&
          p.toppings.every((t) => selectedToppings.includes(t)) &&
          selectedToppings.every((t) => p.toppings.includes(t))
      )
    ) {
      setError("A pizza with these exact toppings already exists.");
      return;
    }

    const { error } = await supabase
      .from("pizzas")
      .insert([{ title: title.trim(), toppings: selectedToppings }]);

    if (error) console.error("Error adding pizza:", error);
    else {
      await fetchPizzas();
      setSelectedToppings([]);
      setTitle("");
      setError("");
    }
  };

  const deletePizza = async (id: number) => {
    const { error } = await supabase.from("pizzas").delete().eq("id", id);
    if (error) console.error("Error deleting pizza:", error);
    else setPizzas(pizzas.filter((p) => p.id !== id));
  };

  const updatePizza = async () => {
    if (!editingPizza) return;

    if (!title.trim()) {
      setError("Please enter a pizza title.");
      return;
    }

    if (
      pizzas.some(
        (p) =>
          p.id !== editingPizza.id &&
          p.title.toLowerCase() === title.toLowerCase().trim()
      )
    ) {
      setError("A pizza with this title already exists.");
      return;
    }

    if (
      pizzas.some(
        (p) =>
          p.id !== editingPizza.id &&
          p.toppings.length === selectedToppings.length &&
          p.toppings.every((t) => selectedToppings.includes(t)) &&
          selectedToppings.every((t) => p.toppings.includes(t))
      )
    ) {
      setError("A pizza with these exact toppings already exists.");
      return;
    }

    const { error } = await supabase
      .from("pizzas")
      .update({ title: title.trim(), toppings: selectedToppings })
      .eq("id", editingPizza.id);

    if (error) console.error("Error updating pizza:", error);
    else {
      await fetchPizzas();
      setEditingPizza(null);
      setSelectedToppings([]);
      setTitle("");
      setError("");
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white max-w-[800px] mx-auto">
      <div className="flex items-center mb-4">
        <Link href="/" className="text-blue-500 mr-4">
          ← Back
        </Link>
        <h1 className="text-2xl">Manage Pizzas</h1>
      </div>

      <ul className="mb-4">
        {pizzas.map((pizza) => (
          <li
            key={pizza.id}
            className="flex justify-between items-center border-b border-white py-2"
          >
            <div>
              <div>Title: {pizza.title}</div>
              <div>Toppings: {pizza.toppings.join(", ")}</div>
            </div>
            <div>
              <button
                onClick={() => {
                  setEditingPizza(pizza);
                  setSelectedToppings(pizza.toppings);
                  setTitle(pizza.title);
                }}
                className="text-blue-500 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => deletePizza(pizza.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <h2 className="text-xl mb-4">Create a Pizza</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Pizza Title"
          className="border border-white rounded p-2 mb-2 w-full bg-transparent text-white"
        />
        <div className="border border-white rounded p-2 mb-2 w-full">
          {toppings.map((topping) => (
            <label key={topping.name} className="flex items-center mb-2">
              <input
                type="checkbox"
                value={topping.name}
                checked={selectedToppings.includes(topping.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedToppings([...selectedToppings, topping.name]);
                  } else {
                    setSelectedToppings(
                      selectedToppings.filter((t) => t !== topping.name)
                    );
                  }
                }}
                className="mr-2"
              />
              {topping.name}
            </label>
          ))}
        </div>

        {editingPizza ? (
          <div>
            <button
              onClick={updatePizza}
              className="bg-white text-black rounded p-2 mr-2"
            >
              Update Pizza
            </button>
            <button
              onClick={() => {
                setEditingPizza(null);
                setSelectedToppings([]);
              }}
              className="text-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={addPizza}
            className="bg-white text-black rounded p-2"
          >
            Add Pizza
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
