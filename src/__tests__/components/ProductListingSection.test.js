import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductListingSection } from '../../pages/ProductListing/components/ProductListingSection/ProductListingSection';
import { DataProvider } from '../../contexts/DataProvider';
import { BrowserRouter } from 'react-router-dom';

// Mock the context hooks
jest.mock('../../../../contexts/DataProvider.js', () => ({
  useData: () => ({
    state: {
      allProductsFromApi: [
        {
          _id: '1',
          id: '1',
          name: 'Test Product',
          original_price: 100,
          discounted_price: 80,
          category_name: 'Test Category',
          is_stock: true,
          rating: 4.5,
          reviews: 10,
          trending: true,
          img: 'test-image.jpg',
        },
        {
          _id: '2',
          id: '2',
          name: 'Test Product 2',
          original_price: 120,
          discounted_price: 90,
          category_name: 'Test Category 2',
          is_stock: true,
          rating: 4.0,
          reviews: 5,
          trending: false,
          img: 'test-image-2.jpg',
        },
      ],
      inputSearch: '',
      filters: {
        rating: '',
        categories: [],
        price: [],
        sort: '',
      },
    },
  }),
}));

jest.mock('../../../../contexts/UserDataProvider.js', () => ({
  useUserData: () => ({
    isProductInCart: () => false,
    isProductInWishlist: () => false,
    wishlistHandler: jest.fn(),
    addToCartHandler: jest.fn(),
    cartLoading: false,
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    this.callback([{ isIntersecting: true, target: element }]);
  }
  unobserve() {}
  disconnect() {}
};

describe('ProductListingSection Component', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    Object.defineProperty(window, 'scrollTo', {
      value: jest.fn(),
      writable: true,
    });
  });

  test('renders products correctly', async () => {
    render(
      <BrowserRouter>
        <ProductListingSection />
      </BrowserRouter>
    );

    // Check if products are rendered
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });

  test('shows "Add To Cart" button for products not in cart', async () => {
    render(
      <BrowserRouter>
        <ProductListingSection />
      </BrowserRouter>
    );

    await waitFor(() => {
      const addToCartButtons = screen.getAllByText('Add To Cart');
      expect(addToCartButtons.length).toBeGreaterThan(0);
    });
  });

  test('shows trending label for trending products', async () => {
    render(
      <BrowserRouter>
        <ProductListingSection />
      </BrowserRouter>
    );

    await waitFor(() => {
      const trendingLabels = screen.getAllByText('Trending');
      expect(trendingLabels.length).toBe(1); // Only one product is trending
    });
  });

  test('handles scroll events for infinite scrolling', async () => {
    render(
      <BrowserRouter>
        <ProductListingSection />
      </BrowserRouter>
    );

    // Simulate scroll event
    fireEvent.scroll(window, { target: { scrollY: 1000 } });

    // Check if more products are loaded (in this case, we only have 2 mock products)
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });
});