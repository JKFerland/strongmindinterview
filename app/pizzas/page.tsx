"use client";

import Link from "next/link";
import { usePizzas } from "../../hooks/usePizzas";

export default function Pizzas() {
  const {
    pizzas,
    toppings,
    selectedToppings,
    setSelectedToppings,
    editingPizza,
    setEditingPizza,
    title,
    setTitle,
    error,
    addPizza,
    deletePizza,
    updatePizza,
  } = usePizzas();

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
