import { renderHook, act, waitFor } from '@testing-library/react';
import { supabase } from '../lib/supabaseClient';
import { usePizzas } from './usePizzas';
import '@testing-library/jest-dom';

jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('usePizzas hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches pizzas and toppings on mount', async () => {
    // Mock supabase.from('pizzas').select('*') call
    (supabase.from as jest.Mock).mockImplementation((tableName: string) => {
      if (tableName === 'pizzas') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              { id: 1, title: 'Margherita', toppings: ['Tomato', 'Cheese'] },
              { id: 2, title: 'Pepperoni', toppings: ['Tomato', 'Cheese', 'Pepperoni'] },
            ],
            error: null,
          }),
        };
      }
      if (tableName === 'toppings') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              { name: 'Tomato' },
              { name: 'Cheese' },
              { name: 'Pepperoni' },
            ],
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { result } = renderHook(() => usePizzas());

    await waitFor(() => {
      // We wait until pizzas have been loaded
      expect(result.current.pizzas).toHaveLength(2);
      // We also wait until toppings have been loaded
      expect(result.current.toppings).toHaveLength(3);
    });

    expect(supabase.from).toHaveBeenCalledTimes(2); // "pizzas" + "toppings"
  });

  it('adds a new pizza successfully', async () => {
    // 1) Mock to fetch existing pizzas (empty list for simplicity)
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });
    // 2) Mock to fetch toppings
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        data: [{ name: 'Tomato' }, { name: 'Cheese' }],
        error: null,
      }),
    });
    // 3) Mock insertion
    (supabase.from as jest.Mock).mockReturnValueOnce({
      insert: jest.fn().mockResolvedValue({
        error: null,
      }),
    });
    // 4) Mock re-fetch after insertion
    (supabase.from as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            title: 'My New Pizza',
            toppings: ['Tomato', 'Cheese'],
          },
        ],
        error: null,
      }),
    });

    const { result } = renderHook(() => usePizzas());

    // Wait for initial data fetch
    await waitFor(() => {
      expect(result.current.toppings.length).toBeGreaterThan(0);
    });

    // Fill in title and toppings
    act(() => {
      result.current.setTitle('My New Pizza');
      result.current.setSelectedToppings(['Tomato', 'Cheese']);
    });

    // Trigger add
    await act(async () => {
      await result.current.addPizza();
    });

    // Check if the pizza was added to state
    await waitFor(() => {
      expect(result.current.error).toBe('');
      expect(result.current.pizzas).toHaveLength(1);
      expect(result.current.pizzas[0].title).toBe('My New Pizza');
    });
  });

  it('does not add a pizza if title already exists', async () => {
    (supabase.from as jest.Mock).mockImplementation((tableName: string) => {
      if (tableName === 'pizzas') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ id: 1, title: 'Margherita', toppings: ['Tomato', 'Cheese'] }],
            error: null,
          }),
        };
      }
      if (tableName === 'toppings') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [{ name: 'Tomato' }, { name: 'Cheese' }],
            error: null,
          }),
        };
      }
      return { select: jest.fn() };
    });

    const { result } = renderHook(() => usePizzas());

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.pizzas.length).toBe(1);
    });

    // Try to add pizza with same title
    act(() => {
      result.current.setTitle('Margherita');
      result.current.setSelectedToppings(['Tomato', 'Cheese']);
    });

    await act(async () => {
      await result.current.addPizza();
    });

    expect(result.current.error).toBe('A pizza with this title already exists.');
    expect(result.current.pizzas).toHaveLength(1);
  });

  it('deletes a pizza', async () => {
    // 1) Mock fetch pizzas
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: [{ id: 1, title: 'Margherita', toppings: ['Tomato', 'Cheese'] }],
        error: null,
      }),
    }));
    // 2) Mock fetch toppings
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: [{ name: 'Tomato' }, { name: 'Cheese' }],
        error: null,
      }),
    }));
    // 3) Mock delete
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    }));

    const { result } = renderHook(() => usePizzas());

    await waitFor(() => {
      expect(result.current.pizzas).toHaveLength(1);
    });

    // Delete the pizza
    await act(async () => {
      await result.current.deletePizza(1);
    });

    expect(result.current.pizzas).toHaveLength(0);
  });

  it('updates a pizza', async () => {
    // 1) Mock initial pizzas
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            title: 'Margherita',
            toppings: ['Tomato', 'Cheese'],
          },
        ],
        error: null,
      }),
    }));
    // 2) Mock initial toppings
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          { name: 'Tomato' },
          { name: 'Cheese' },
          { name: 'Pepperoni' },
        ],
        error: null,
      }),
    }));
    // 3) Mock update
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    }));
    // 4) Mock refetch
    (supabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            title: 'Updated Pizza',
            toppings: ['Tomato', 'Pepperoni'],
          },
        ],
        error: null,
      }),
    }));

    const { result } = renderHook(() => usePizzas());

    await waitFor(() => {
      expect(result.current.pizzas).toHaveLength(1);
      expect(result.current.toppings).toHaveLength(3);
    });

    // Begin editing
    act(() => {
      result.current.setEditingPizza(result.current.pizzas[0]);
      result.current.setTitle('Updated Pizza');
      result.current.setSelectedToppings(['Tomato', 'Pepperoni']);
    });

    // Trigger update
    await act(async () => {
      await result.current.updatePizza();
    });

    // Verify updated state
    await waitFor(() => {
      expect(result.current.error).toBe('');
      expect(result.current.pizzas[0].title).toBe('Updated Pizza');
      expect(result.current.pizzas[0].toppings).toEqual(['Tomato', 'Pepperoni']);
    });
  });
});
