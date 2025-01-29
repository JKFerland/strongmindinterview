import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function useToppings() {
  const [toppings, setToppings] = useState<{ name: string }[]>([]);
  const [newTopping, setNewTopping] = useState("");
  const [error, setError] = useState("");
  const [editingTopping, setEditingTopping] = useState<{ name: string } | null>(null);
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

  return {
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
  };
} 