import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { DataProvider, useData } from '../../contexts/DataProvider';
import { getAllProducts, getAllCategories } from '../../services/services';

// Mock the API services
jest.mock('../../services/services', () => ({
  getAllProducts: jest.fn(),
  getAllCategories: jest.fn(),
}));

// Test component that uses the context
const TestComponent = () => {
  const { state, loading, error, refreshData } = useData();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error.toString()}</div>
      <div data-testid="products-count">{state.allProductsFromApi.length}</div>
      <div data-testid="categories-count">{state.allCategories.length}</div>
      <button data-testid="refresh-button" onClick={refreshData}>
        Refresh
      </button>
    </div>
  );
};

describe('DataProvider Context', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    getAllProducts.mockResolvedValue({
      request: { status: 200 },
      data: {
        products: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' },
        ],
      },
    });
    
    getAllCategories.mockResolvedValue({
      request: { status: 200 },
      data: {
        categories: [
          { id: '1', name: 'Category 1' },
          { id: '2', name: 'Category 2' },
        ],
      },
    });
  });

  test('fetches products and categories on mount', async () => {
    let component;
    
    await act(async () => {
      component = render(
        <DataProvider>
          <TestComponent />
        </DataProvider>
      );
    });

    const { getByTestId } = component;
    
    await waitFor(() => {
      expect(getAllProducts).toHaveBeenCalledTimes(1);
      expect(getAllCategories).toHaveBeenCalledTimes(1);
      expect(getByTestId('products-count').textContent).toBe('2');
      expect(getByTestId('categories-count').textContent).toBe('2');
      expect(getByTestId('loading').textContent).toBe('false');
      expect(getByTestId('error').textContent).toBe('false');
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock API error
    getAllProducts.mockRejectedValue(new Error('API error'));
    
    let component;
    
    await act(async () => {
      component = render(
        <DataProvider>
          <TestComponent />
        </DataProvider>
      );
    });

    const { getByTestId } = component;
    
    await waitFor(() => {
      expect(getAllProducts).toHaveBeenCalledTimes(1);
      expect(getByTestId('error').textContent).toBe('true');
      expect(getByTestId('loading').textContent).toBe('false');
    });
  });

  test('refreshes data when refreshData is called', async () => {
    let component;
    
    await act(async () => {
      component = render(
        <DataProvider>
          <TestComponent />
        </DataProvider>
      );
    });

    const { getByTestId } = component;
    
    // Wait for initial load
    await waitFor(() => {
      expect(getAllProducts).toHaveBeenCalledTimes(1);
      expect(getAllCategories).toHaveBeenCalledTimes(1);
    });
    
    // Reset mock call counts
    getAllProducts.mockClear();
    getAllCategories.mockClear();
    
    // Trigger refresh
    await act(async () => {
      getByTestId('refresh-button').click();
    });
    
    // Check if APIs were called again
    await waitFor(() => {
      expect(getAllProducts).toHaveBeenCalledTimes(1);
      expect(getAllCategories).toHaveBeenCalledTimes(1);
    });
  });
});