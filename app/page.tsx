"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-black text-white max-w-[800px] mx-auto">
      <h1 className="text-2xl mb-4 text-center">
        🍕 Welcome to the Pizza Manager 3000 🍕
      </h1>
      <ul className="mb-4">
        <li className="mb-2">
          <Link href="/toppings" className="text-blue-500">
            Manage Toppings
          </Link>
        </li>
        <li>
          <Link href="/pizzas" className="text-blue-500">
            Manage Pizzas
          </Link>
        </li>
      </ul>
    </div>
  );
}
