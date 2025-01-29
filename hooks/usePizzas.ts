import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

interface Pizza {
  id: number;
  title: string;
  toppings: string[];
}

interface Topping {
  name: string;
}

export function usePizzas() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
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

    if (pizzas.some((p) => p.title.toLowerCase() === title.toLowerCase().trim())) {
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

  return {
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
  };
} 