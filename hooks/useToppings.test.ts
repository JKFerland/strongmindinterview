import { renderHook, act } from '@testing-library/react';
import { useToppings } from './useToppings';
import { supabase } from '../lib/supabaseClient';

// Mock supabase client
jest.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  },
}));

describe('useToppings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useToppings());
    
    expect(result.current.toppings).toEqual([]);
    expect(result.current.newTopping).toBe('');
    expect(result.current.error).toBe('');
    expect(result.current.editingTopping).toBeNull();
    expect(result.current.updatedTopping).toBe('');
  });

  it('should fetch toppings on mount', async () => {
    const mockToppings = [{ name: 'cheese' }, { name: 'pepperoni' }];
    const mockSelect = jest.fn().mockResolvedValue({ data: mockToppings, error: null });
    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect,
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useToppings());

    // Wait for the useEffect to complete
    await act(async () => {
      await mockSelect();
    });

    expect(result.current.toppings).toEqual(mockToppings);
  });

  it('should add a new topping', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useToppings());

    // First set the new topping value
    act(() => {
      result.current.setNewTopping('mushrooms');
    });

    // Then perform the add operation
    await act(async () => {
      await result.current.addTopping();
    });

    expect(mockInsert).toHaveBeenCalledWith([{ name: 'mushrooms' }]);
    expect(result.current.newTopping).toBe('');
  });

  it('should prevent duplicate toppings', async () => {
    const mockToppings = [{ name: 'mushrooms' }];
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
    const mockFrom = jest.fn().mockReturnValue({
      insert: mockInsert,
      select: jest.fn().mockResolvedValue({ data: mockToppings, error: null }),
    });
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useToppings());

    // Wait for initial fetch to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Set the new topping value
    act(() => {
      result.current.setNewTopping('mushrooms');
    });

    // Attempt to add the duplicate topping
    await act(async () => {
      await result.current.addTopping();
    });

    expect(mockInsert).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Topping already exists.');
    expect(result.current.newTopping).toBe('mushrooms');
  });
}); 